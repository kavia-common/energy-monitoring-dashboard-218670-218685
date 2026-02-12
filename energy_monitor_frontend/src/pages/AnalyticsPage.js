import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { getInsights, getLeaderboard } from "../api/analytics";

// PUBLIC_INTERFACE
function AnalyticsPage() {
  /** Analytics/Insights page. */
  const { token } = useAuth();
  const [range, setRange] = useState("7d");
  const [insights, setInsights] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setIsLoading(true);
      setError("");
      try {
        const [i, l] = await Promise.all([getInsights(token, { range }), getLeaderboard(token, { range })]);
        if (!cancelled) {
          setInsights(i);
          setLeaderboard(Array.isArray(l) ? l : l.items || []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load analytics.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, range]);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Analytics</h1>
          <p>Insights, anomalies, and top consumers. (Backend-powered; falls back to demo if missing.)</p>
        </div>
        <div className="header-right">
          <label className="pill">
            Range{" "}
            <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
            </select>
          </label>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="alert">Crunching numbers...</div> : null}

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Summary</div>
              <div className="card-subtitle">Totals for selected range.</div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-2">
              <div className="stat">
                <div className="stat-label">TOTAL kWh</div>
                <div className="stat-value">{(insights?.summary?.total_kwh ?? 0).toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">EST. COST</div>
                <div className="stat-value">${(insights?.summary?.estimated_cost ?? 0).toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">AVG WATTS</div>
                <div className="stat-value">{(insights?.summary?.avg_watts ?? 0).toFixed(0)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">PEAK WATTS</div>
                <div className="stat-value">{(insights?.summary?.peak_watts ?? 0).toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Consumers</div>
              <div className="card-subtitle">Devices with highest energy usage.</div>
            </div>
          </div>
          <div className="card-body" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboard}>
                <CartesianGrid stroke="rgba(80,255,199,0.12)" strokeDasharray="4 4" />
                <XAxis dataKey="name" stroke="rgba(227,255,245,0.6)" />
                <YAxis stroke="rgba(227,255,245,0.6)" />
                <Tooltip
                  contentStyle={{ background: "rgba(11,12,22,0.95)", border: "1px solid rgba(80,255,199,0.2)" }}
                />
                <Bar dataKey="kwh" fill="#ff4fd8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Insights</div>
            <div className="card-subtitle">Actionable notes for optimization.</div>
          </div>
        </div>
        <div className="card-body">
          {insights?.insights?.length ? (
            <div className="grid">
              {insights.insights.map((x) => (
                <div key={x.id} className="alert" style={{ borderColor: "rgba(83,167,255,0.25)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ color: "var(--text)" }}>{x.title}</strong>
                      <div className="small" style={{ marginTop: 6 }}>
                        {x.description}
                      </div>
                    </div>
                    <div className="pill">
                      {String(x.kind || "info").toUpperCase()} • conf{" "}
                      <strong>{Math.round((x.confidence || 0) * 100)}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="small">No insights available.</div>
          )}
        </div>
      </div>
    </>
  );
}

export default AnalyticsPage;
