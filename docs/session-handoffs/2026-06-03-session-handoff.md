Continue Time Report Reminder. Tauri v2 macOS app that takes over the screen with a comedic overlay reminding Hanna to log time in Harvest. Currently in initial-design phase, 6 of ~10 stages done.

**Current state:** `feat/initial-design`, clean working tree, no git remote configured yet, no open PRs.

**Where we left off:**
Stages 1–6 of `docs/superpowers/plans/2026-06-03-time-report-reminder.md` are implemented and verified end-to-end by Hanna in `pnpm tauri dev`: scaffold, fullscreen vibrancy overlay, escape-to-dismiss, tray icon, Cmd+Shift+H global shortcut, css-sprites animation (calm birds sway → red intruder slides in at 2.2s → all jerk-dance at 2.5s), pulsing REPORT YOUR TIME button that opens Harvest in a configurable Chrome profile, and a calm→annoying audio swap synced to the animation. Last commit `ced6e01`. Next is Stage 7 (state persistence + Harvest API + should_trigger logic).

**Key files to read first:**
- `docs/superpowers/plans/2026-06-03-time-report-reminder.md` — the plan; start at Stage 7 (line ~1250)
- `docs/superpowers/specs/2026-06-03-time-report-reminder-design.md` — design spec
- `src-tauri/src/lib.rs` — Tauri builder, tray, shortcut wiring, ActivationPolicy::Accessory for hidden dock
- `src-tauri/src/commands.rs` — `hide_overlay` + `report_time` (validates url + chrome_profile before exec)
- `src/App.tsx` — overlay UI; uses `key={runId}` to remount animation on visibilitychange
- `assets-config.json` — runtime config: animation name, audio paths, shortcut, harvestUrl, chromeProfile

**Next step:** Stage 7 Task 7.1 Step 1 — add Rust deps in `src-tauri/`: `cargo add serde --features derive && cargo add serde_json && cargo add chrono --features serde`. Then create `src-tauri/src/state.rs` with the `AppState` struct + `load`/`save`/`is_snoozed` methods and the included `#[cfg(test)] mod tests`. Plan has the exact code to paste at line ~1268.

**Context not in files:**
- Hanna's Harvest URL is `https://leadfront.harvestapp.com/time`; her Chrome `Default` profile (`Hanna (stormfors.com)`) is the work one and is wired in `assets-config.json`. Don't change either without asking.
- Two gotchas the plan does not flag, baked into commits but worth knowing:
  - Transparent overlay windows on macOS need both the `macos-private-api` Cargo feature AND `"macOSPrivateApi": true` in `tauri.conf.json` — without the JSON flag the overlay window silently fails to be created and `get_webview_window("overlay")` returns None.
  - The overlay window is created hidden at app startup, so any animation/audio tied to React mount runs and finishes before the user ever sees it. Trigger from `visibilitychange` (see App.tsx `runId` pattern) instead of `useEffect` mount.
- Placeholder audio is ffmpeg-synthesized tones (220Hz calm sine, 880Hz tremolo annoying). Real freesound clips can drop into `src/audio/calm.mp3` / `annoying.mp3` without touching code.
- No git remote and no GitHub account chosen yet. Ask Hanna which account (personal / work / rookie / ranksmile) before `gh repo create`.
