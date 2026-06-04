use chrono::{Datelike, NaiveDate, Utc, Weekday};
use serde::Deserialize;
use std::collections::BTreeMap;

#[derive(Debug, Deserialize)]
struct TimeEntry {
    spent_date: NaiveDate,
    hours: f64,
}

#[derive(Debug, Deserialize)]
struct TimeEntriesResponse {
    time_entries: Vec<TimeEntry>,
}

#[derive(Debug, Deserialize)]
struct UserMeResponse {
    id: u64,
}

pub struct HarvestClient {
    token: String,
    account_id: String,
    http: reqwest::Client,
}

impl HarvestClient {
    pub fn new(token: String, account_id: String) -> Self {
        Self { token, account_id, http: reqwest::Client::new() }
    }

    async fn me_id(&self) -> Result<u64, String> {
        let resp = self
            .http
            .get("https://api.harvestapp.com/v2/users/me")
            .bearer_auth(&self.token)
            .header("Harvest-Account-ID", &self.account_id)
            .header("User-Agent", "Unlogged/1.0 (https://github.com/hanna-fmw/unlogged)")
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !resp.status().is_success() {
            return Err(format!("Harvest /users/me: {}", resp.status()));
        }

        let body: UserMeResponse = resp.json().await.map_err(|e| e.to_string())?;
        Ok(body.id)
    }

    pub async fn missing_weekdays_this_month(&self) -> Result<u32, String> {
        let today = Utc::now().date_naive();
        let month_start = NaiveDate::from_ymd_opt(today.year(), today.month(), 1).unwrap();
        let user_id = self.me_id().await?;

        let url = format!(
            "https://api.harvestapp.com/v2/time_entries?user_id={}&from={}&to={}&per_page=2000",
            user_id, month_start, today
        );

        let resp = self
            .http
            .get(&url)
            .bearer_auth(&self.token)
            .header("Harvest-Account-ID", &self.account_id)
            .header("User-Agent", "Unlogged/1.0 (https://github.com/hanna-fmw/unlogged)")
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !resp.status().is_success() {
            return Err(format!("Harvest API: {}", resp.status()));
        }

        let body: TimeEntriesResponse = resp.json().await.map_err(|e| e.to_string())?;
        Ok(count_missing_weekdays(&body.time_entries, month_start, today))
    }
}

fn count_missing_weekdays(entries: &[TimeEntry], from: NaiveDate, to: NaiveDate) -> u32 {
    let mut totals: BTreeMap<NaiveDate, f64> = BTreeMap::new();
    for e in entries {
        *totals.entry(e.spent_date).or_default() += e.hours;
    }

    let mut missing = 0u32;
    let mut d = from;
    while d <= to {
        let wd = d.weekday();
        let is_weekday = !matches!(wd, Weekday::Sat | Weekday::Sun);
        if is_weekday {
            let logged = totals.get(&d).copied().unwrap_or(0.0);
            if logged < 8.0 {
                missing += 1;
            }
        }
        d = d.succ_opt().unwrap();
    }
    missing
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(y: i32, m: u32, day: u32) -> NaiveDate {
        NaiveDate::from_ymd_opt(y, m, day).unwrap()
    }

    #[test]
    fn full_8_hour_day_is_not_missing() {
        let entries = vec![
            TimeEntry { spent_date: d(2026, 6, 1), hours: 8.0 },
        ];
        assert_eq!(count_missing_weekdays(&entries, d(2026, 6, 1), d(2026, 6, 1)), 0);
    }

    #[test]
    fn partial_day_is_missing() {
        let entries = vec![
            TimeEntry { spent_date: d(2026, 6, 1), hours: 5.5 },
        ];
        assert_eq!(count_missing_weekdays(&entries, d(2026, 6, 1), d(2026, 6, 1)), 1);
    }

    #[test]
    fn weekend_days_never_count() {
        let entries: Vec<TimeEntry> = vec![];
        assert_eq!(count_missing_weekdays(&entries, d(2026, 6, 6), d(2026, 6, 7)), 0);
    }

    #[test]
    fn multiple_entries_same_day_sum() {
        let entries = vec![
            TimeEntry { spent_date: d(2026, 6, 1), hours: 4.0 },
            TimeEntry { spent_date: d(2026, 6, 1), hours: 4.0 },
        ];
        assert_eq!(count_missing_weekdays(&entries, d(2026, 6, 1), d(2026, 6, 1)), 0);
    }
}
