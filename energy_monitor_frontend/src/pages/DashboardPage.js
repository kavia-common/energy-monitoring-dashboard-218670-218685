import React, { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { listDevices } from "../api/devices";
import { getHistory } from "../api/energy";

function formatShortTs(iso) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:00`;
  } catch {
    return iso;
  }
}

// PUBLIC_INTERFACE
function DashboardPage() {
  /** Main dashboard: overview + aggregate chart across first device (or synthetic if none). */
  const { token } = useAuth();
  const [devices, setDevices] = useState([]);
  const [series, setSeries] = useState([]);
  const [range, setRange] = useState("24h");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError("");
      try {
        const devs = await listDevices(token);
        if (cancelled) return;
        setDevices(Array.isArray(devs) ? devs : devs.items || []);
        const firstId = (Array.isArray(devs) ? devs : devs.items || [])[0]?.id;
        const hist = firstId ? await getHistory(token, firstId, { range, bucket: "1h" }) : await getHistory(token, "demo", { range, bucket: "1h" });
        if (cancelled) return;
        setSeries(Array.isArray(hist) ? hist : hist.items || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, range]);

  const stats = useMemo(() => {
    if (!series.length) {
      return { avg: 0, peak: 0, kwh: 0 };
    }
    const watts = series.map((p) => Number(p.watts || 0));
    const avg = watts.reduce((a, b) => a + b, 0) / Math.max(1, watts.length);
    const peak = Math.max(...watts);
    const kwh = series.reduce((a, p) => a + Number(p.kwh || 0), 0);
    return { avg, peak, kwh };
  }, [series]);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>
            System overview with retro telemetry visualization. Select a device for detailed live and historical charts.
          </p>
        </div>
        <div className="header-right">
          <div className="pill">
            Devices: <strong>{devices.length}</strong>
          </div>
          <label className="pill">
            Range{" "}
            <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
            </select>
          </label>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="alert">Loading telemetry...</div> : null}

      <div className="grid grid-3" style={{ marginTop: 14 }}>
        <div className="stat">
          <div className="stat-label">AVG WATTS</div>
          <div className="stat-value">{stats.avg.toFixed(0)}</div>
          <div className="stat-note">Average across selected range.</div>
        </div>
        <div className="stat">
          <div className="stat-label">PEAK WATTS</div>
          <div className="stat-value">{stats.peak.toFixed(0)}</div>
          <div className="stat-note">Highest observed draw.</div>
        </div>
        <div className="stat">
          <div className="stat-label">TOTAL kWh</div>
          <div className="stat-value">{stats.kwh.toFixed(2)}</div>
          <div className="stat-note">Estimated energy usage.</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Energy Trend</div>
            <div className="card-subtitle">Area chart (watts) over time.</div>
          </div>
          <div className="small">Source: first device (fallback: demo)</div>
        </div>
        <div className="card-body" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="wattsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22f1c3" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22f1c3" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(80,255,199,0.12)" strokeDasharray="4 4" />
              <XAxis dataKey="ts" tickFormatter={formatShortTs} stroke="rgba(227,255,245,0.6)" />
              <YAxis stroke="rgba(227,255,245,0.6)" />
              <Tooltip
                contentStyle={{ background: "rgba(11,12,22,0.95)", border: "1px solid rgba(80,255,199,0.2)" }}
                labelFormatter={(l) => `t=${l}`}
              />
              <Area type="monotone" dataKey="watts" stroke="#22f1c3" fill="url(#wattsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
