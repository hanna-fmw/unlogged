mod commands;
mod overlay;

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{App, AppHandle};

const MENU_TRIGGER: &str = "trigger";
const MENU_QUIT: &str = "quit";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            setup_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::hide_overlay])
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
