import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { getDevice } from "../api/devices";
import { getHistory, getRealtime } from "../api/energy";

function formatTick(iso) {
  try {
    const d = new Date(iso);
    return `${d.getHours()}:00`;
  } catch {
    return iso;
  }
}

// PUBLIC_INTERFACE
function DeviceDetailPage() {
  /** Device detail: live reading + historical chart. */
  const { token } = useAuth();
  const { deviceId } = useParams();

  const [device, setDevice] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [history, setHistory] = useState([]);
  const [range, setRange] = useState("24h");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const d = await getDevice(token, deviceId);
        const hist = await getHistory(token, deviceId, { range, bucket: "1h" });
        if (!cancelled) {
          setDevice(d);
          setHistory(Array.isArray(hist) ? hist : hist.items || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load device.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, deviceId, range]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const rt = await getRealtime(token, deviceId);
        if (!cancelled) setRealtime(rt);
      } catch {
        // ignore (will show last known)
      }
    }
    poll();
    const t = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [token, deviceId]);

  const summary = useMemo(() => {
    const watts = Number(realtime?.watts || 0);
    const v = Number(realtime?.voltage || 0);
    const a = Number(realtime?.amps || (v ? watts / v : 0));
    return { watts, voltage: v, amps: a };
  }, [realtime]);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>{device?.name || "Device"}</h1>
          <p>
            Device ID: <span className="kbd">{deviceId}</span> — live telemetry polls every 5s.
          </p>
        </div>
        <div className="header-right">
          <label className="pill">
            Range{" "}
            <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
            </select>
          </label>
          <div className="pill">
            Location: <strong>{device?.location || "—"}</strong>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="alert">Loading device telemetry...</div> : null}

      <div className="grid grid-3" style={{ marginTop: 14 }}>
        <div className="stat">
          <div className="stat-label">LIVE WATTS</div>
          <div className="stat-value">{summary.watts.toFixed(0)}</div>
          <div className="stat-note">Current draw (approx).</div>
        </div>
        <div className="stat">
          <div className="stat-label">VOLTAGE</div>
          <div className="stat-value">{summary.voltage ? summary.voltage.toFixed(1) : "—"}</div>
          <div className="stat-note">Line voltage.</div>
        </div>
        <div className="stat">
          <div className="stat-label">AMPS</div>
          <div className="stat-value">{summary.amps ? summary.amps.toFixed(2) : "—"}</div>
          <div className="stat-note">Derived from watts/voltage.</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Historical Watts</div>
            <div className="card-subtitle">Line chart over selected range.</div>
          </div>
          <div className="small">Bucket: 1h (fallback demo if backend missing)</div>
        </div>
        <div className="card-body" style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid stroke="rgba(80,255,199,0.12)" strokeDasharray="4 4" />
              <XAxis dataKey="ts" tickFormatter={formatTick} stroke="rgba(227,255,245,0.6)" />
              <YAxis stroke="rgba(227,255,245,0.6)" />
              <Tooltip
                contentStyle={{ background: "rgba(11,12,22,0.95)", border: "1px solid rgba(80,255,199,0.2)" }}
                labelFormatter={(l) => `t=${l}`}
              />
              <Line type="monotone" dataKey="watts" stroke="#53a7ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default DeviceDetailPage;
