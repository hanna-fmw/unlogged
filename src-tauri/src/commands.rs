use std::process::Command;

use tauri::AppHandle;

use crate::overlay;

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    overlay::hide_overlay(&app)
}

#[tauri::command]
pub fn report_time(app: AppHandle, url: String, chrome_profile: String) -> Result<(), String> {
    let url = validate_url(&url)?;
    let profile = validate_profile(&chrome_profile)?;
    open_in_chrome(url, profile)?;
    overlay::hide_overlay(&app)
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
