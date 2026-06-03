use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use crate::overlay;

const HARVEST_URL: &str = "https://leadfront.harvestapp.com/time";

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    overlay::hide_overlay(&app)
}

#[tauri::command]
pub fn report_time(app: AppHandle) -> Result<(), String> {
    app.opener()
        .open_url(HARVEST_URL, None::<&str>)
        .map_err(|e| e.to_string())?;
    overlay::hide_overlay(&app)
}
