# Walkthrough — for tech and non-tech audiences

A 4-minute talk track. Tech bits are paired with a one-line plain-English version in italics so the room stays with you.

---

**Open.** "I built a small Mac app that nags me on Fridays to log my hours in Harvest. It refuses to be ignored. Let me show you."

**Trigger.** Press Cmd+Shift+H. The screen goes black, a green terminal-style line types itself in: `> INTRUSION DETECTED - UNLOGGED DAYS: 4`. An ASCII skull builds character by character. A glowing `[ REPORT TIME → ]` button types in. You can either click it (opens Harvest), snooze 15 minutes, or — if you're disciplined — escape and ignore me.

> "The whole thing is a fullscreen window that sits on top of everything else, and the count is live — it's actually asking Harvest how many days this month I'm under 8 hours."

**Why Tauri, not Electron.** Tauri is a framework that lets me write the UI as a regular web app (React) but ship the shell as a tiny Rust binary that uses the Mac's own browser engine. Electron bundles a whole copy of Chrome with every app — that's why Slack is 300 MB. This app is 15 MB and uses no measurable CPU when it's not yelling at me.

> *In plain English: instead of every app shipping its own browser to draw the screen, this one borrows the browser that's already on your Mac.*

**The schedule.** Every Friday at 16:45 a LaunchAgent fires the app. LaunchAgent is macOS's modern version of cron — a small XML file in `~/Library/LaunchAgents/` that tells the OS "run this binary at this time." When it fires, the app checks three things before showing the overlay: am I in a meeting (is Zoom or Teams the frontmost app on screen?), have I snoozed it, and is there actually anything missing in Harvest? Only if all three are no does it take over the screen.

> *In plain English: it's polite. If you're in a meeting it stays quiet. If you've already logged your hours, it stays quiet.*

**The Harvest part.** One web request goes out to Harvest's API with my token, comes back with every time entry for this month, the Rust code groups them by day and counts the weekdays that have less than 8 hours. That's the number you see at the top.

> *In plain English: it just asks Harvest the same question their own website asks — "how many hours did Hanna log this month?" — and counts the gaps.*

**The animation seam.** Each animation — the terminal skull, an earlier emergency-siren version, a placeholder one with birds — is a separate plug-in folder. Swapping the active one is a one-line config change. The whole point of building the boring plumbing first was so I could iterate on the creative content without touching the wiring underneath.

> *In plain English: the "what does it look like" part and the "how does it work" part are kept apart, so I can change one without breaking the other.*

**Wrap.** "Open source on my GitHub. It's Harvest-only today but the architecture allows any time-tracker. If you steal the schedule-plus-meeting-detection pattern for something else, that's the most useful 200 lines of Rust in the repo."

---

## If you've got an extra minute

What's not done yet, in honesty order:
- The audio is a synthesized siren placeholder. Real audio is coming, generated in Suno.
- "Are you in a meeting" currently checks the app on top of your screen. A proper check would ask the OS "is anything actually using the camera or microphone right now?" which catches a Zoom call you've left running in the background.
- The app is ad-hoc signed, which means the first time you open it Mac asks "are you sure?". A properly notarised build would skip that. Apple Developer membership costs $99/year, which I'm not going to pay for a single-user nag app.
