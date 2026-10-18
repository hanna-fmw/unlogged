# REVIEW.md

What the automated reviewer should care about in unlogged. Keep it short. When the reviewer flags the same thing twice, add a line here or a lint rule.

## What failure looks like here
- The overlay fires when it shouldn't (in a meeting, while snoozed, hours already logged) or never fires on Friday.
- The overlay can't be dismissed: the report or snooze button stops working and the screen stays blocked.
- Wrong count of missing weekdays from Harvest.
- The Harvest token leaks: printed, logged, sent anywhere but Harvest, or stored outside the app's state file.

## Always high risk
- `src-tauri/src/harvest.rs`, `src-tauri/src/state.rs`, `src/settings/`: the Harvest API, the token and where it is stored.
- `src-tauri/src/trigger.rs`, `src-tauri/src/meeting.rs`, `src-tauri/src/overlay.rs`: when the overlay takes over the screen.
- `src-tauri/capabilities/`, `src-tauri/tauri.conf.json`: window permissions and security settings.
- `launchd/`: what starts at login.

## Skip
- `pnpm-lock.yaml`, `src-tauri/Cargo.lock`, `src-tauri/icons/`, `public/`, `docs/`.

## Rules
- Give a file and line as evidence for every finding, never a guess from a name.
- At most 3 nits per round.
