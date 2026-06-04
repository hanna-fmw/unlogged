Continue Time Report Reminder. Tauri v2 macOS app — fullscreen comedic overlay reminding Hanna to log time in Harvest. All 10 plan stages are implemented; current focus is creative content (animations, audio).

**Current state:** `feat/initial-design`, clean working tree, no git remote, no open PRs. Production .app installed at `/Applications/TimeReportReminder.app`. LaunchAgent loaded (`launchctl list | grep timereport`) — next fire Friday 16:45. App added to Login Items so Cmd+Shift+H survives reboots.

**Where we left off:**
Stages 1–10 done plus the settings UI and a working terminal-skull animation Hanna loves. End-to-end verified:
- Harvest creds set via tray menu → "Harvest credentials…" (uses a real Tauri window at `?view=settings`, NOT nano-the-JSON anymore). State at `~/Library/Application Support/dev.unlogged/state.json` (0600 perms).
- Counter shows real missing-day count from Harvest.
- LaunchAgent fire was tested by setting the plist 2 min into the future, loading, watching the overlay appear, then resetting to Friday 16:45.
- macOS prompted once for "TimeReportReminder wants to control System Events" (used by `meeting.rs` osascript frontmost-app check). Granted. Won't re-prompt unless app signature changes.

Current active animation: `terminal-skull` (registered in `src/animations/index.ts`, selected via `assets-config.json` → `"animation": "terminal-skull"`). Other modules still in the registry: `css-sprites` (v1 placeholder birds), `siren` (pulsing red dome — built but not used right now).

**Key files to read first:**
- `src/animations/terminal-skull/` — the active animation. `index.tsx` is the orchestrator (phases: header → skull → footer → button → done). `Typewriter.tsx` and `SkullReveal.tsx` use a `useRef` for `onDone` to prevent re-renders from restarting the typing (this is the fix from commit 46cf54a — DO NOT inline the callback in the effect deps again).
- `src-tauri/src/harvest.rs` — Harvest API client. Key gotcha baked in: `user_id=me` is NOT supported by the Harvest API (returns 0 entries silently). Must fetch `/users/me` first to get the integer id, then use it in `/time_entries?user_id=<id>`. See `me_id()` and `missing_weekdays_this_month()`.
- `src-tauri/src/lib.rs` — Tauri builder. Tray menu has 3 items (Trigger now, Harvest credentials…, Quit). `setup_scheduled` handles `--scheduled` flag. `ActivationPolicy::Accessory` keeps the app dock-icon-less so Login Items launch is silent.
- `src/animations/types.ts` — module interface. Note `ownsChrome?: boolean` — when true (terminal-skull sets it), App.tsx hides its default MissingCounter + ReportButton + SnoozeButton and the module renders its own terminal-styled versions.
- `launchd/dev.unlogged.plist` — schedule (Weekday 5 = Friday, 16:45). `launchd/load.sh` and `unload.sh` install/remove.

**Next step:** creative work. Two open invites from Hanna:
1. Replace placeholder audio. `src/audio/siren.mp3` is an ffmpeg-synthesized sine+vibrato placeholder. Hanna will generate real audio in Suno; drop the file at `src/audio/siren.mp3` (or any path, then point the active animation module's `audio.calm`/`audio.annoying` at it). Hanna confirmed Elvis is still copyrighted; Suno gets used for original "Elvis-flavored" tracks instead. No automation for Suno — manual generation.
2. Try other design directions she said yes to: "brutalist / industrial alert", "editorial / Apple-grade minimal", "Y2K / glossy". Each = a new module under `src/animations/<name>/`, registered in `index.ts`, picked by `assets-config.json`.

If she wants to refine terminal-skull further: spacing/sizes are in `src/animations/terminal-skull/styles.css`. The skull ASCII art is in `skull.ts` — easy to swap for a different one (e.g. a cleaner skull, a chevron, a "DANGER" sign).

**Context not in files:**
- Harvest creds: PAT name in Harvest dashboard is "time-report-reminder". Account ID 746603. Token is stored on disk only; never paste it in chat (Hanna leaked one earlier this session, revoked it).
- Two icons in menu bar today are NOT a bug — one is the live app, the other is a macOS NSStatusItem phantom from earlier killed dev runs. Will clear on next macOS restart. Don't drag any tray icon off the menu bar — macOS sometimes kills the live one too (happened during this session).
- The `siren` and `css-sprites` modules also still work; switch by editing `assets-config.json` `"animation"` field. No rebuild of Rust needed for animation swaps (frontend HMR picks it up in dev, or just rebuild the .app for production).
- When iterating on animations, use `pnpm tauri dev` (fast HMR). For releases use `pnpm tauri build` then copy `src-tauri/target/release/bundle/macos/TimeReportReminder.app` to `/Applications/` (rm the old one first). DMG bundle step sometimes fails on Hanna's machine — the .app is built fine anyway, that error is safe to ignore.
- `pmset repeat wakeorpoweron F 16:44:00` would force the Mac to wake before the scheduled fire, but Hanna declined to set it. Without it, an asleep Mac at 16:45 fires the trigger only after the next wake.
