export default function App() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        background: "rgba(255,255,255,0.18)",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ fontSize: 64 }}>Time Report Reminder</h1>
    </div>
  );
}
