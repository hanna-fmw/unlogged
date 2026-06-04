# Tech Explainer

A short tour of the moving parts in Time Report Reminder, written so I can talk through it without notes.

## What is Tauri

Tauri is a way to ship a desktop app where the UI is a regular web app (HTML/CSS/JS, in our case React) and the "shell" — the window, the tray icon, the global shortcut, the file I/O — is a small Rust binary. On macOS the UI runs inside `WKWebView`, which is the same Safari rendering engine that the OS already ships. So we don't bundle a browser.

Compare to Electron: Electron ships an entire copy of Chromium with every app, which is why an Electron app weighs ~150 MB before you write a single line of code. A Tauri app weighs ~5–15 MB because the webview is borrowed from the operating system. The trade-off is that you only have the features the OS webview supports — on macOS that means Safari, with all its quirks.

## Why Rust + WebView for this

Three reasons that mattered for this app:

1. **Native bits that a browser can't do.** Global keyboard shortcut, a real macOS menu-bar tray icon, "always on top + fullscreen + transparent" window with the real OS frosted-glass background. All of these are AppKit calls. Rust talks to AppKit through the `objc` crate; the Tauri ecosystem wraps the common ones (`window-vibrancy`, `tauri-plugin-global-shortcut`).
2. **Small distributable.** A 15 MB app that idles at near-zero CPU is more honest for a thing you install just so it can yell at you on Fridays.
3. **Type-safe IPC.** Every function the UI calls into Rust is declared with `#[tauri::command]` and typed on both sides. No hand-rolled JSON message bus.

## What's a LaunchAgent

A LaunchAgent is a per-user background task that macOS's `launchd` (the init system that boots and supervises everything) runs on a schedule or in response to events. It's the modern replacement for cron on macOS.

The unit of configuration is a `.plist` file in `~/Library/LaunchAgents/`. Ours uses `StartCalendarInterval` (cron-style: "Weekday 5, Hour 16, Minute 45") to fire the binary every Friday afternoon with `--scheduled`. `launchctl load <path>` registers it; `launchctl unload <path>` removes it. The system survives reboots and logouts.

## How macOS vibrancy works

The frosted-glass blur behind the overlay isn't a CSS filter — it's the actual `NSVisualEffectView` from AppKit, the same one Finder and System Settings use. macOS itself blurs whatever is behind the window in real time. We just declare which "material" we want (HudWindow, Sidebar, etc.) and the compositor handles it on the GPU.

In Rust we call into AppKit via the `window-vibrancy` crate, which wraps the `objc` bindings. It needs two things wired up: the `macos-private-api` Cargo feature on the `tauri` crate, and `"macOSPrivateApi": true` in `tauri.conf.json`. Without the JSON flag the transparent window silently fails to be created.

## Harvest API call

One GET request, two headers:

```
GET /v2/time_entries?user_id=me&from=<month_start>&to=<today>
Authorization: Bearer <PAT>
Harvest-Account-ID: <account_id>
```

Harvest returns every time entry as `{ spent_date, hours }`. The "missing weekdays" math runs in Rust on the response: sum hours by date, walk Mon–Fri from the first of the month to today, count any weekday where total hours < 8. Weekends never count. That number is what the red counter at the top of the overlay shows.

The PAT and account ID live in `~/Library/Application Support/com.hanna.timereport/state.json` with `0600` permissions. Set via the tray menu → "Harvest credentials…".

## Module-swap design

Animations are first-class. Each one is a folder under `src/animations/<name>/` exporting an `AnimationModule`:

```ts
export interface AnimationModule {
  name: string;
  Component: React.FC;
  audio: { calm: string; annoying: string; swapAtMs: number };
}
```

A registry in `src/animations/index.ts` lists every available module. `assets-config.json` at the project root picks the active one by name. Drop a new folder, register it, change one config line, rebuild. No code in `App.tsx` changes.

This is the seam where the actual creative work happens. The v1 animation is intentionally a placeholder (CSS-sprite birds, generated audio tones) so the entire pipeline could be wired and verified before any time goes into character design.

## What I'd build next

- **In-meeting detection beyond frontmost app.** Right now `meeting.rs` looks at the frontmost AppleScript process name. A real check would use AVFoundation to ask "is anything currently using the camera or microphone?" — that catches a Zoom call running in the background. Requires TCC (Transparency Consent Control) permission, which is its own onboarding flow.
- **macOS Focus / Do Not Disturb integration.** Skip the trigger automatically when Focus is on.
- **Developer ID signing + notarisation.** Currently the app is ad-hoc signed, so first launch needs a right-click-Open. A real signed-and-notarised build opens normally.
- **Configurable schedule from the settings window** instead of editing the plist.
- **AI-generated character video** as one of the animation modules — the module interface is ready for it.
