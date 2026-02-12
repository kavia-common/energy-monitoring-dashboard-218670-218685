import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { createAlert, deleteAlert, listAlerts, updateAlert } from "../api/alerts";
import { listDevices } from "../api/devices";
import Modal from "../components/Modal";

function normalize(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
}

// PUBLIC_INTERFACE
function AlertsPage() {
  /** Alerts configuration UI. */
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setError("");
      try {
        const [a, d] = await Promise.all([listAlerts(token), listDevices(token)]);
        if (!cancelled) {
          setAlerts(normalize(a));
          setDevices(normalize(d));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load alerts.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onDelete = async (a) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete alert "${a.name || a.id}"?`)) return;
    try {
      await deleteAlert(token, a.id);
      setAlerts((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Alerts</h1>
          <p>Rules that trigger notifications when thresholds are exceeded (e.g. watts &gt; 800).</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" type="button" onClick={() => setModal({ mode: "create" })}>
            + New Alert
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="alert">Loading alert rules...</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Alert Rules</div>
            <div className="card-subtitle">Attach to a device or apply globally.</div>
          </div>
          <div className="pill">
            Rules: <strong>{alerts.length}</strong>
          </div>
        </div>
        <div className="card-body">
          <table className="table" aria-label="Alert rules table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Device</th>
                <th>Condition</th>
                <th>Enabled</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length ? (
                alerts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name || a.id}</td>
                    <td className="mono">{a.device_id || "GLOBAL"}</td>
                    <td className="mono">{a.condition || "—"}</td>
                    <td>{a.enabled ? "YES" : "NO"}</td>
                    <td>
                      <div className="split" style={{ justifyContent: "flex-start" }}>
                        <button className="btn" type="button" onClick={() => setModal({ mode: "edit", alert: a })}>
                          Edit
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => onDelete(a)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="small">
                    No alert rules configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal ? (
        <AlertModal
          mode={modal.mode}
          alert={modal.alert}
          devices={devices}
          token={token}
          onClose={() => setModal(null)}
          onError={(msg) => setError(msg)}
          onSaved={(saved) => {
            setAlerts((prev) => {
              const idx = prev.findIndex((x) => x.id === saved.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = { ...prev[idx], ...saved };
                return copy;
              }
              return [saved, ...prev];
            });
            setModal(null);
          }}
        />
      ) : null}
    </>
  );
}

function AlertModal({ mode, alert, devices, token, onClose, onSaved, onError }) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(alert?.name || "");
  const [deviceId, setDeviceId] = useState(alert?.device_id || "");
  const [condition, setCondition] = useState(alert?.condition || "watts > 800");
  const [enabled, setEnabled] = useState(alert?.enabled ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    onError("");

    if (!name.trim()) return onError("Alert name is required.");
    if (!condition.trim()) return onError("Condition is required.");

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        device_id: deviceId.trim() ? deviceId.trim() : null,
        condition: condition.trim(),
        enabled: Boolean(enabled),
      };
      const saved = isEdit ? await updateAlert(token, alert.id, payload) : await createAlert(token, payload);
      onSaved(saved);
    } catch (err) {
      onError(err.message || "Save failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Alert Rule" : "New Alert Rule"} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <label className="label" htmlFor="a_name">
          Name
        </label>
        <input id="a_name" className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="label" htmlFor="a_device">
          Device (optional)
        </label>
        <select id="a_device" className="select" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          <option value="">GLOBAL</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name || d.id}
            </option>
          ))}
        </select>

        <label className="label" htmlFor="a_condition">
          Condition
        </label>
        <input
          id="a_condition"
          className="input"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder='e.g. "watts > 800"'
        />

        <label className="label" htmlFor="a_enabled">
          Enabled
        </label>
        <select
          id="a_enabled"
          className="select"
          value={enabled ? "yes" : "no"}
          onChange={(e) => setEnabled(e.target.value === "yes")}
        >
          <option value="yes">YES</option>
          <option value="no">NO</option>
        </select>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>

      <div className="small" style={{ marginTop: 10 }}>
        Example conditions: <span className="kbd">watts &gt; 800</span> • <span className="kbd">kwh &gt; 5</span>
      </div>
    </Modal>
  );
}

export default AlertsPage;
