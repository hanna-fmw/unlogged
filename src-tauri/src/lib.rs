mod commands;
mod overlay;
mod state;

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
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::hide_overlay, commands::report_time])
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
