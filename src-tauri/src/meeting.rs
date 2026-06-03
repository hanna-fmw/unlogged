use std::process::Command;

const MEETING_APPS: &[&str] = &[
    "zoom.us",
    "Microsoft Teams",
    "Microsoft Teams (work or school)",
    "Google Meet",
    "Webex",
    "Slack",
];

pub fn likely_in_meeting() -> bool {
    let out = Command::new("osascript")
        .args(["-e", "tell application \"System Events\" to get name of first application process whose frontmost is true"])
        .output();
    match out {
        Ok(o) if o.status.success() => {
            let name = String::from_utf8_lossy(&o.stdout).trim().to_string();
            MEETING_APPS.iter().any(|m| name.eq_ignore_ascii_case(m))
        }
        _ => false,
    }
}
