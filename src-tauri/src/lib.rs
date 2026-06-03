mod commands;
mod harvest;
mod meeting;
mod overlay;
mod state;
mod trigger;

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;
use tauri::{App, AppHandle};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

const MENU_TRIGGER: &str = "trigger";
const MENU_QUIT: &str = "quit";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Err(e) = overlay::show_overlay(app) {
                            eprintln!("show_overlay failed: {e}");
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);
            setup_tray(app)?;
            setup_shortcut(app)?;
            setup_scheduled(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::hide_overlay,
            commands::report_time,
            commands::snooze,
            commands::set_harvest_credentials,
            commands::missing_days,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn setup_tray(app: &mut App) -> tauri::Result<()> {
    let trigger = MenuItem::with_id(app, MENU_TRIGGER, "Trigger now", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, MENU_QUIT, "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&trigger, &quit])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .on_menu_event(handle_menu_event)
        .build(app)?;
    Ok(())
}

fn setup_shortcut(app: &mut App) -> tauri::Result<()> {
    let sc = Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyH);
    app.global_shortcut()
        .register(sc)
        .map_err(|e| tauri::Error::Anyhow(Box::new(std::io::Error::other(e.to_string())).into()))?;
    Ok(())
}

fn setup_scheduled(app: &mut App) {
    let args: Vec<String> = std::env::args().collect();
    if !args.iter().any(|a| a == "--scheduled") {
        return;
    }
    let app_handle = app.handle().clone();
    tauri::async_runtime::spawn(async move {
        let path = commands::state_path_handle(&app_handle);
        let s = state::AppState::load(&path);

        let in_meeting = meeting::likely_in_meeting();
        let missing = match (&s.harvest_token, &s.harvest_account_id) {
            (Some(t), Some(a)) => {
                let client = harvest::HarvestClient::new(t.clone(), a.clone());
                client.missing_weekdays_this_month().await.unwrap_or(1)
            }
            _ => 1,
        };
        let decision = trigger::should_trigger(in_meeting, &s, missing, chrono::Utc::now());
        match decision {
            trigger::Decision::Trigger => {
                if let Err(e) = overlay::show_overlay(&app_handle) {
                    eprintln!("show_overlay failed: {e}");
                }
            }
            trigger::Decision::Skip(reason) => {
                eprintln!("scheduled trigger skipped: {:?}", reason);
                app_handle.exit(0);
            }
        }
    });
}

fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id.as_ref() {
        MENU_TRIGGER => {
            if let Err(e) = overlay::show_overlay(app) {
                eprintln!("show_overlay failed: {e}");
            }
        }
        MENU_QUIT => {
            app.exit(0);
        }
        _ => {}
    }
}
