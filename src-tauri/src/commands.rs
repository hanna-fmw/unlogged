use tauri::AppHandle;

use crate::overlay;

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    overlay::hide_overlay(&app)
}
