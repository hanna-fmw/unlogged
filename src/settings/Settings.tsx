import { useState, type FormEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { setHarvestCredentials } from "../lib/tauri";

export default function Settings() {
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await setHarvestCredentials(token.trim(), accountId.trim());
      setStatus("saved");
      setTimeout(() => void getCurrentWindow().hide(), 600);
    } catch (err) {
      setStatus("error");
      setError(String(err));
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        padding: 24,
        fontFamily: "system-ui",
        display: "grid",
        gap: 12,
        background: "white",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Personal Access Token</span>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="4293764.pt.…"
          autoFocus
          required
          style={inputStyle}
        />
      </label>
      <label style={{ display: "grid", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Account ID</span>
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="746603"
          inputMode="numeric"
          required
          style={inputStyle}
        />
      </label>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
        <button
          type="button"
          onClick={() => void getCurrentWindow().hide()}
          style={buttonStyle("secondary")}
        >
          Cancel
        </button>
        <button type="submit" disabled={status === "saving"} style={buttonStyle("primary")}>
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save"}
        </button>
      </div>
      {error && <div style={{ color: "#b91c1c", fontSize: 12 }}>{error}</div>}
      <p style={{ fontSize: 11, color: "#6b7280", marginTop: "auto" }}>
        Get both at{" "}
        <a href="https://id.getharvest.com/developers" target="_blank" rel="noreferrer">
          id.getharvest.com/developers
        </a>
        . Token is stored locally with 0600 perms.
      </p>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 14,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontFamily: "inherit",
};

const buttonStyle = (variant: "primary" | "secondary"): React.CSSProperties => ({
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 6,
  cursor: "pointer",
  border: variant === "primary" ? "none" : "1px solid #d1d5db",
  background: variant === "primary" ? "#111827" : "white",
  color: variant === "primary" ? "white" : "#111827",
});
