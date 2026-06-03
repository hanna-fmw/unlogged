import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getActiveAnimation } from "./animations";
import ReportButton from "./overlay/ReportButton";

const mod = getActiveAnimation();

export default function App() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") void invoke("hide_overlay").catch(console.error);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        background: "rgba(255,255,255,0.18)",
        display: "grid",
        gridTemplateRows: "1fr auto",
        placeItems: "center",
        padding: 48,
        fontFamily: "system-ui",
      }}
    >
      <mod.Component />
      <ReportButton />
    </div>
  );
}
