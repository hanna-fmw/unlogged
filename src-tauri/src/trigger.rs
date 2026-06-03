use chrono::{DateTime, Utc};

use crate::state::AppState;

#[derive(Debug, PartialEq)]
pub enum Decision {
    Trigger,
    Skip(SkipReason),
}

#[derive(Debug, PartialEq)]
pub enum SkipReason {
    InMeeting,
    Snoozed,
    NothingMissing,
}

pub fn should_trigger(
    in_meeting: bool,
    state: &AppState,
    missing: u32,
    now: DateTime<Utc>,
) -> Decision {
    if in_meeting {
        return Decision::Skip(SkipReason::InMeeting);
    }
    if state.is_snoozed(now) {
        return Decision::Skip(SkipReason::Snoozed);
    }
    if missing == 0 {
        return Decision::Skip(SkipReason::NothingMissing);
    }
    Decision::Trigger
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    fn now() -> DateTime<Utc> { Utc::now() }

    #[test]
    fn meeting_skips_first() {
        let s = AppState::default();
        assert_eq!(should_trigger(true, &s, 99, now()), Decision::Skip(SkipReason::InMeeting));
    }

    #[test]
    fn snoozed_skips() {
        let n = now();
        let s = AppState { snoozed_until: Some(n + Duration::minutes(5)), ..Default::default() };
        assert_eq!(should_trigger(false, &s, 99, n), Decision::Skip(SkipReason::Snoozed));
    }

    #[test]
    fn nothing_missing_skips() {
        let s = AppState::default();
        assert_eq!(should_trigger(false, &s, 0, now()), Decision::Skip(SkipReason::NothingMissing));
    }

    #[test]
    fn otherwise_triggers() {
        let s = AppState::default();
        assert_eq!(should_trigger(false, &s, 3, now()), Decision::Trigger);
    }
}
