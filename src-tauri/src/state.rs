use std::path::PathBuf;
use std::fs;
use std::io::Write;
#[cfg(unix)]
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AppState {
    #[serde(default)]
    pub snoozed_until: Option<DateTime<Utc>>,
    #[serde(default)]
    pub harvest_token: Option<String>,
    #[serde(default)]
    pub harvest_account_id: Option<String>,
    #[serde(default)]
    pub last_reported_at: Option<DateTime<Utc>>,
}

impl AppState {
    pub fn load(path: &PathBuf) -> Self {
        match fs::read_to_string(path) {
            Ok(s) => serde_json::from_str(&s).unwrap_or_default(),
            Err(_) => AppState::default(),
        }
    }

    pub fn save(&self, path: &PathBuf) -> std::io::Result<()> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
            #[cfg(unix)]
            fs::set_permissions(parent, fs::Permissions::from_mode(0o700))?;
        }
        let s = serde_json::to_string_pretty(self).unwrap();
        let mut opts = fs::OpenOptions::new();
        opts.write(true).create(true).truncate(true);
        #[cfg(unix)]
        opts.mode(0o600);
        let mut f = opts.open(path)?;
        f.write_all(s.as_bytes())
    }

    pub fn is_snoozed(&self, now: DateTime<Utc>) -> bool {
        self.snoozed_until.map(|t| t > now).unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;
    use std::env;

    #[test]
    fn snoozed_until_in_future_is_snoozed() {
        let now = Utc::now();
        let s = AppState { snoozed_until: Some(now + Duration::minutes(5)), ..Default::default() };
        assert!(s.is_snoozed(now));
    }

    #[test]
    fn snoozed_until_in_past_is_not_snoozed() {
        let now = Utc::now();
        let s = AppState { snoozed_until: Some(now - Duration::minutes(5)), ..Default::default() };
        assert!(!s.is_snoozed(now));
    }

    #[test]
    fn roundtrip_save_load() {
        let mut p = env::temp_dir();
        p.push(format!("trr-state-{}.json", std::process::id()));
        let s = AppState {
            harvest_token: Some("tok".into()),
            harvest_account_id: Some("123".into()),
            ..Default::default()
        };
        s.save(&p).unwrap();
        let loaded = AppState::load(&p);
        assert_eq!(loaded.harvest_token.as_deref(), Some("tok"));
        assert_eq!(loaded.harvest_account_id.as_deref(), Some("123"));
        let _ = std::fs::remove_file(&p);
    }
}
