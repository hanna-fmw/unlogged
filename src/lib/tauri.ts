import { invoke } from "@tauri-apps/api/core";

export const hideOverlay = () => invoke<void>("hide_overlay");
export const reportTime = (url: string, chromeProfile: string) =>
  invoke<void>("report_time", { url, chromeProfile });
export const snooze = () => invoke<void>("snooze");
export const setHarvestCredentials = (token: string, accountId: string) =>
  invoke<void>("set_harvest_credentials", { token, accountId });
export const missingDays = () => invoke<number>("missing_days");
