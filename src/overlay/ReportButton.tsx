import { invoke } from "@tauri-apps/api/core";
import config from "../../assets-config.json";

export default function ReportButton() {
  const onClick = () =>
    void invoke("report_time", {
      url: config.harvestUrl,
      chromeProfile: config.chromeProfile,
    }).catch(console.error);

  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 56,
        fontWeight: 900,
        padding: "24px 64px",
        borderRadius: 9999,
        border: "none",
        cursor: "pointer",
        color: "white",
        background: "linear-gradient(180deg, #ef4444, #b91c1c)",
        boxShadow: "0 12px 40px rgba(239,68,68,0.5)",
        animation: "pulse 1.1s ease-in-out infinite",
      }}
    >
      REPORT YOUR TIME
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
      `}</style>
    </button>
  );
}
