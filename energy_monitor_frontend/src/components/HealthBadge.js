import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

const HEALTH_PATH = process.env.REACT_APP_HEALTHCHECK_PATH || "/healthz";

// PUBLIC_INTERFACE
function HealthBadge() {
  /** Shows backend connectivity status. */
  const [status, setStatus] = useState({ state: "checking", detail: "" });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await apiRequest(HEALTH_PATH);
        if (!cancelled) setStatus({ state: "ok", detail: "backend online" });
      } catch (e) {
        if (!cancelled) setStatus({ state: "down", detail: e.message || "unreachable" });
      }
    }

    run();
    const t = setInterval(run, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const color =
    status.state === "ok"
      ? "var(--ok)"
      : status.state === "down"
      ? "var(--danger)"
      : "var(--warn)";

  return (
    <div className="pill" aria-label="Backend health status">
      NET: <strong style={{ color }}>{status.state.toUpperCase()}</strong>{" "}
      <span className="small">({status.detail})</span>
    </div>
  );
}

export default HealthBadge;
