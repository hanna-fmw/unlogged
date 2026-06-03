# Time Report Reminder — Design Doc

**Date:** 2026-06-03
**Author:** Hanna Hosk
**Status:** Approved for implementation planning

## Purpose

A small, fun macOS desktop app that takes over the screen on a schedule (and on demand) to remind the user to log time in Harvest. Built as a company knowledge-session demo: technically interesting (Tauri v2 + Rust + native macOS APIs + Harvest API), visually playful (comedic character animation + audio gag), and lightweight enough that "small `.app` size" is itself a talking point.

Two triggers, both required:
1. **Manual** — global keyboard shortcut and tray menu item. Bypasses all checks. Critical for live demos.
2. **Scheduled** — every Friday at 16:45 via LaunchAgent. Runs sanity checks (meeting? snoozed? nothing missing?) before firing.

## Stack

- **Tauri v2** (Rust backend + WebView frontend)
- **React + Vite** (frontend)
- **macOS native APIs** via Tauri plugins: vibrancy (frosted glass), global shortcuts, tray, autostart
- **Harvest v2 API** (Personal Access Token auth) for "missing days" detection
- **launchd** (macOS native scheduler) via a user LaunchAgent plist

## Project structure

```
~/projects/unlogged/
├── src-tauri/              # Rust backend (Tauri native layer)
│   ├── src/
│   │   ├── main.rs         # App entry, window setup, tray, shortcuts
│   │   ├── overlay.rs      # Borderless fullscreen overlay window logic
│   │   ├── meeting.rs      # "Is Zoom/Teams/Meet frontmost?" check
│   │   ├── harvest.rs      # Harvest API client (check missing days)
│   │   └── state.rs        # Snooze + token + last-reported persistence
│   └── tauri.conf.json
├── src/                    # React + Vite frontend
│   ├── App.tsx             # Mounts the active animation module
│   ├── animations/         # Swappable animation modules
│   │   ├── index.ts        # Exports active module based on config
│   │   ├── css-sprites/    # v1: pure CSS/SVG
│   │   ├── video/          # v2: mp4/webm loop
│   │   └── lottie/         # v3: Lottie JSON
│   ├── audio/              # Swappable audio assets
│   │   ├── calm.mp3
│   │   └── annoying.mp3
│   └── components/
│       └── ReportButton.tsx
├── assets-config.json      # Points to active animation+audio module
├── launchd/
│   └── dev.unlogged.plist   # Friday 16:45 schedule
└── docs/
    ├── tech-explainer.md   # For Q&A during the demo
    └── demo-script.md      # 3-5 min walkthrough
```

**Key idea:** `assets-config.json` is the single file the user edits to swap animation module or audio tracks. Asset file swaps need no rebuild; module-type swap is a one-line config change.

## Overlay window behavior

- Borderless, fullscreen, always-on-top, covers menu bar.
  Tauri config: `fullscreen: true`, `decorations: false`, `alwaysOnTop: true`, `visibleOnAllWorkspaces: true`.
- macOS native vibrancy for the frosted-glass desktop blur via the `window-vibrancy` crate
  (`NSVisualEffectMaterial::HudWindow` as first choice, `Sidebar` as fallback).
  CSS `backdrop-filter` as final fallback if vibrancy fails.
- Window only exists when triggered. App runs headless in the tray; overlay window is created on trigger, destroyed on dismiss. Keeps idle resource use near zero.
- **Escape key dismisses** — demo safety, never get stuck on stage.
- Click-through disabled while active. User must click the button or press Esc.

## Animation module interface

Each module under `src/animations/<name>/` exports:

```ts
export interface AnimationModule {
  name: string;
  Component: React.FC<{ onSequenceComplete?: () => void }>;
  audio: { calm: string; annoying: string; switchAtMs: number };
}
```

`assets-config.json` picks the active one:

```json
{ "animation": "css-sprites", "audioOverrides": null }
```

**v1 implementation:** `css-sprites/` — calm blue characters (SVG) on the left sing softly; a manic red intruder character (vibe-matched to the reference, not a copy, to avoid IP issues) bursts in from the right; all characters snap into a stiff synchronized jerk-dance; audio flips from calm to grating at the same moment.

**v2/v3:** drop-in video loop or Lottie. Same interface; one-line config swap.

## Triggers

**Manual (always works, bypasses all checks):**
- Global keyboard shortcut `Cmd+Shift+H` (configurable in `assets-config.json`). Registered via Tauri's `globalShortcut` plugin.
- Menu-bar tray icon with a "Trigger now" item.
- Both call the same Rust command `show_overlay(bypass_checks=true)`.

**Scheduled (Friday 16:45, runs checks):**
- macOS LaunchAgent launches the app binary with `--scheduled` flag.
- App reads the flag, runs `should_trigger()`, exits silently if false.

**`should_trigger()` logic (scheduled only):**
1. Is Zoom / Microsoft Teams / Google Meet (in Chrome/Safari) the frontmost app? → skip, log reason.
2. Is `snoozedUntil` in the future? → skip.
3. Query Harvest: any weekday in the current month with `< 8` logged hours where date `<=` today? → if zero missing, skip.
4. Otherwise → show overlay.

Manual triggers skip all four checks.

## Harvest API integration

- **Auth:** Personal Access Token + Account ID. User generates both at
  `https://id.getharvest.com/developers` (no admin permissions needed; any employee can do this for their own account). Stored in `state.json`.
- **Headers on every request:**
  - `Authorization: Bearer <token>`
  - `Harvest-Account-ID: <id>`
  - `User-Agent: TimeReportReminder (noreply@example.com)` (Harvest requires a User-Agent)
- **Endpoint:** `GET /v2/time_entries?user_id=me&from=<month-start>&to=<today>`
- **Logic:** Group entries by `spent_date`, sum `hours` per day, count weekdays (Mon–Fri) where the date is on-or-before today and total hours `< 8`.
- **Caching:** Cache the count for 5 minutes to avoid hammering the API on rapid manual triggers.
- **Failure mode (fail loud):** If the API call fails (network, bad token), log the error and **show the overlay anyway**. Better to nag unnecessarily than miss reporting because the API was down.
- **Overlay UI uses the count:** A large red blinking counter — e.g. **"3 DAYS MISSING"** — rendered next to the pulsing button. If the count is zero on a scheduled trigger, the overlay never shows. On manual trigger with zero missing, the overlay still shows (for demo) but the counter renders as a green "ALL CAUGHT UP" instead.

## State persistence

Stored at `~/Library/Application Support/time-report-reminder/state.json`:

```json
{
  "snoozedUntil": "2026-06-03T17:00:00Z",
  "harvestToken": "...",
  "harvestAccountId": "...",
  "lastReportedAt": "2026-05-30T16:48:00Z"
}
```

- **Snooze button** on the overlay → sets `snoozedUntil = now + 15 minutes`.
- **Big "REPORT YOUR TIME" button** → opens `https://leadfront.harvestapp.com/time` in the default browser, sets `lastReportedAt = now`, dismisses overlay.
- **Harvest token** entered once via the tray menu: "Settings → Set Harvest token" opens a simple Tauri dialog with two text fields.

## Scheduling (LaunchAgent)

File: `~/Library/LaunchAgents/dev.unlogged.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>dev.unlogged</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Applications/TimeReportReminder.app/Contents/MacOS/time-report-reminder</string>
    <string>--scheduled</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>5</integer>
    <key>Hour</key><integer>16</integer>
    <key>Minute</key><integer>45</integer>
  </dict>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
```

- Load: `launchctl load ~/Library/LaunchAgents/dev.unlogged.plist`
- Unload: `launchctl unload ~/Library/LaunchAgents/dev.unlogged.plist`

**For the demo's tech-explainer doc:** A `plist` is macOS's XML config format for system services. A LaunchAgent is a per-user background task managed by `launchd`, macOS's init system. `StartCalendarInterval` is cron-like; `Weekday: 5` means Friday (Sunday = 0).

## Packaging & distribution

- Build: `pnpm tauri build` produces a `.app` bundle at `src-tauri/target/release/bundle/macos/`.
- Code signing skipped for local demo. On first launch the user right-clicks → Open to bypass Gatekeeper; covered in `demo-script.md`.
- Future work (not in v1): Developer ID signing + notarisation for distribution to colleagues' machines.

## Documentation deliverables

Two markdown files in `docs/`, written alongside implementation:

- **`tech-explainer.md`** — what Tauri is, why Rust + WebView vs Electron (size, memory), what a LaunchAgent is, how macOS vibrancy works, what the Harvest API call does. Covers likely Q&A questions from technical colleagues. Includes a "what I'd build next" section: camera/mic detection, macOS Focus integration, Developer ID signing, configurable schedules in-app — so technical attendees see the roadmap and don't ask "have you thought about X?"
- **`demo-script.md`** — 3–5 minute walkthrough with talking points scaled for both technical and non-technical audiences. Beats: scaffold → manual trigger → animation sequence → Harvest "missing days" counter → schedule explainer → wrap.

## Out of scope for v1

- Camera/mic in-use detection (called out as future work in tech-explainer).
- macOS Focus / Do Not Disturb integration (future work).
- In-app settings UI beyond the Harvest token dialog (config via JSON file is fine for v1).
- Code signing and notarisation.
- Windows / Linux builds.
- Multi-user / team features.

## Build stages (for the implementation plan)

1. Scaffold Tauri v2 + React + Vite. Basic window shows.
2. Borderless, fullscreen, always-on-top overlay with macOS vibrancy.
3. Manual trigger: global shortcut + tray menu item.
4. Animation module interface + `css-sprites` v1 implementation.
5. Pulsing "REPORT YOUR TIME" button → opens Harvest URL → dismisses.
6. Audio: calm track → annoying track at the interruption beat.
7. `should_trigger()` checks: frontmost app + snooze + Harvest missing-days.
8. LaunchAgent plist + load/unload commands.
9. Production build (`.app`), Gatekeeper bypass docs.
10. Tech-explainer + demo-script docs.
