use tauri::{AppHandle, Emitter, Manager, WebviewWindow};

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

pub fn show_overlay(app: &AppHandle) -> Result<(), String> {
    let win = app
        .get_webview_window("overlay")
        .ok_or_else(|| "overlay window not found".to_string())?;
    apply_vibrancy_safe(&win);
    // Emit BEFORE show so React can flush a fresh-state render while the
    // window is still hidden — Tauri's webview does not fire
    // `visibilitychange` on `win.show()`/`win.hide()` (tauri-apps/tauri#6864),
    // so the Page Visibility API can't drive this.
    let _ = app.emit("overlay:will-show", ());
    win.show().map_err(|e| e.to_string())?;
    win.set_always_on_top(true).map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[allow(dead_code)]
pub fn hide_overlay(app: &AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("overlay") {
        let _ = win.hide();
    }
    let _ = app.emit("overlay:did-hide", ());
    Ok(())
}

#[cfg(target_os = "macos")]
fn apply_vibrancy_safe(win: &WebviewWindow) {
    let primary = apply_vibrancy(
        win,
        NSVisualEffectMaterial::HudWindow,
        Some(NSVisualEffectState::Active),
        None,
    );
    if primary.is_err() {
        let _ = apply_vibrancy(
            win,
            NSVisualEffectMaterial::Sidebar,
            Some(NSVisualEffectState::Active),
            None,
        );
    }
}

#[cfg(not(target_os = "macos"))]
fn apply_vibrancy_safe(_win: &WebviewWindow) {
    // No-op on non-macOS; CSS backdrop-filter provides the fallback.
}
