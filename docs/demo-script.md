# Demo Script

A 3–5 minute walkthrough. Beats below, with talking-point variants at the end for non-technical audiences.

## 1. Hook (15s)

> "I built a small Mac app to nag me about logging hours in Harvest, because no calendar reminder has ever survived contact with a busy Friday. Let me show you."

## 2. Manual trigger (30s)

Press **Cmd+Shift+H**. The overlay takes over the screen: red "N DAYS MISSING" counter at the top, the animation in the middle, a pulsing red **REPORT YOUR TIME** button at the bottom.

Talking points while it's on screen:
- "Notice the desktop is blurred behind — that's the actual macOS native blur, the same one Finder uses, not a screenshot or a CSS filter."
- "Esc dismisses. Or I click the button…" — click it, Harvest opens in Chrome.

## 3. Harvest integration (45s)

Open the tray menu (top-right icon) → **Trigger now**. The overlay shows the real count of weekdays this month with under 8 hours logged.

> "The app actually queries Harvest. One GET request, two auth headers, then the missing-day math runs in Rust on the response. The counter is live."

Show the tray menu's **Harvest credentials…** item briefly: opens a small window with token + account ID fields. Stored locally with 0600 perms.

## 4. Schedule explainer (45s)

Open `launchd/dev.unlogged.plist` in an editor (or just print it in the terminal).

> "This is a LaunchAgent — macOS's modern cron. Every Friday at 16:45, this thing fires the binary with a --scheduled flag. The Rust code runs a decision tree: am I in a meeting? Am I snoozed? Is there anything actually missing? Only if all three are no does the overlay show up. Manual trigger always works — that's how I'm demoing it now without waiting for Friday."

Optional: show the snooze working. Trigger → Snooze 15 min → from terminal run the binary with `--scheduled` → it prints `scheduled trigger skipped: Snoozed` and exits.

## 5. What's inside (60s)

> "Tauri instead of Electron — same web frontend, but the shell is a Rust binary that borrows the OS's webview instead of bundling Chromium. App is ~15 MB instead of ~150."

Show `src/animations/`:

> "Animations are pluggable. Each folder under here is a self-contained module — component, audio assets, a swap timing. The active one is named in `assets-config.json`. Swap a line, rebuild. The current one is intentionally a placeholder: CSS sprites of birds and synthesized audio tones. The whole point was to get the plumbing — overlay, schedule, Harvest, audio sync — verified before any time goes into the actual character work."

## 6. Wrap (15s)

> "Code's on my GitHub if you want to fork it. The interesting bits to look at are `src-tauri/src/trigger.rs` for the decision tree and `src/animations/types.ts` for the module interface."

---

## Variant for non-technical audience

Skip the Tauri-vs-Electron beat and the Rust mention. Lean into:
- The frosted blur is real macOS, not fake.
- The character is named `___` and is mad you didn't log your hours.
- "It only nags me when I'm not already in a meeting" — the tech is in service of the joke.

## Variant for a 90-second elevator pitch

Skip beats 4 and 5. Hook → manual trigger → "and it runs itself every Friday afternoon" → wrap.
