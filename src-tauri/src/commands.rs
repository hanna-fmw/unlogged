use std::path::PathBuf;
use std::process::Command;

use chrono::{Duration, Utc};
use tauri::{AppHandle, Manager};

use crate::harvest::HarvestClient;
use crate::overlay;
use crate::state::AppState;

pub fn state_path_handle(app: &AppHandle) -> PathBuf {
    let dir = app.path().app_data_dir().expect("no app data dir");
    dir.join("state.json")
}

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    overlay::hide_overlay(&app)
}

#[tauri::command]
pub fn report_time(app: AppHandle, url: String, chrome_profile: String) -> Result<(), String> {
    let url = validate_url(&url)?;
    let profile = validate_profile(&chrome_profile)?;
    open_in_chrome(url, profile)?;

    let path = state_path_handle(&app);
    let mut s = AppState::load(&path);
    s.last_reported_at = Some(Utc::now());
    s.save(&path).map_err(|e| e.to_string())?;

    overlay::hide_overlay(&app)
}

#[tauri::command]
pub fn snooze(app: AppHandle) -> Result<(), String> {
    let path = state_path_handle(&app);
    let mut s = AppState::load(&path);
    s.snoozed_until = Some(Utc::now() + Duration::minutes(15));
    s.save(&path).map_err(|e| e.to_string())?;
    overlay::hide_overlay(&app)
}

#[tauri::command]
pub fn set_harvest_credentials(
    app: AppHandle,
    token: String,
    account_id: String,
) -> Result<(), String> {
    let path = state_path_handle(&app);
    let mut s = AppState::load(&path);
    s.harvest_token = Some(token);
    s.harvest_account_id = Some(account_id);
    s.save(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn missing_days(app: AppHandle) -> Result<u32, String> {
    let path = state_path_handle(&app);
    let s = AppState::load(&path);
    let (Some(tok), Some(acct)) = (s.harvest_token, s.harvest_account_id) else {
        return Err("Harvest credentials not set".into());
    };
    let client = HarvestClient::new(tok, acct);
    client.missing_weekdays_this_month().await
}

fn validate_url(url: &str) -> Result<&str, String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("url must be http(s)".to_string());
    }
    Ok(url)
}

fn validate_profile(profile: &str) -> Result<&str, String> {
    if profile.is_empty()
        || !profile
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == ' ' || c == '_' || c == '-')
    {
        return Err("invalid chrome_profile".to_string());
    }
    Ok(profile)
}

#[cfg(target_os = "macos")]
fn open_in_chrome(url: &str, profile: &str) -> Result<(), String> {
    Command::new("open")
        .args([
            "-na",
            "Google Chrome",
            "--args",
            &format!("--profile-directory={profile}"),
            "--",
            url,
        ])
        .spawn()
        .map_err(|e| format!("failed to launch Chrome: {e}"))?;
    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn open_in_chrome(_url: &str, _profile: &str) -> Result<(), String> {
    Err("Chrome profile launching is only implemented on macOS".to_string())
}
