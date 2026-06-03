import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Settings from "./settings/Settings";

const params = new URLSearchParams(window.location.search);
const view = params.get("view");
const Root = view === "settings" ? Settings : App;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
