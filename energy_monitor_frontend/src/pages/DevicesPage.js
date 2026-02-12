import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createDevice, deleteDevice, listDevices, updateDevice } from "../api/devices";
import Modal from "../components/Modal";

function normalizeDevices(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return [];
}

// PUBLIC_INTERFACE
function DevicesPage() {
  /** Device management: list + create/edit/delete. */
  const { token } = useAuth();

  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null); // { mode: "create"|"edit", device? }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setError("");
      try {
        const res = await listDevices(token);
        if (!cancelled) setDevices(normalizeDevices(res));
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load devices.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onDelete = async (d) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Delete device "${d.name || d.id}"?`)) return;
    try {
      await deleteDevice(token, d.id);
      setDevices((prev) => prev.filter((x) => x.id !== d.id));
    } catch (e) {
      setError(e.message || "Delete failed.");
    }
  };

  const rows = useMemo(() => devices.map((d) => ({ ...d })), [devices]);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Devices</h1>
          <p>Register smart plugs/meters, track status, and jump into detail views.</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" type="button" onClick={() => setModal({ mode: "create" })}>
            + Add Device
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="alert">Loading devices...</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Registered Devices</div>
            <div className="card-subtitle">Select a device to view live + historical readings.</div>
          </div>
          <div className="pill">
            Count: <strong>{devices.length}</strong>
          </div>
        </div>
        <div className="card-body">
          <table className="table" aria-label="Devices table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/app/devices/${encodeURIComponent(d.id)}`} style={{ color: "var(--neon-cyan)" }}>
                        {d.name || "Unnamed Device"}
                      </Link>
                    </td>
                    <td className="mono">{d.id}</td>
                    <td>{d.location || "—"}</td>
                    <td>{d.kind || d.type || "meter"}</td>
                    <td>{d.status || "unknown"}</td>
                    <td>
                      <div className="split" style={{ justifyContent: "flex-start" }}>
                        <button className="btn" type="button" onClick={() => setModal({ mode: "edit", device: d })}>
                          Edit
                        </button>
                        <button className="btn btn-danger" type="button" onClick={() => onDelete(d)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="small">
                    No devices yet. Add one to start monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal ? (
        <DeviceModal
          mode={modal.mode}
          device={modal.device}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            setDevices((prev) => {
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
          token={token}
          onError={(msg) => setError(msg)}
        />
      ) : null}
    </>
  );
}

function DeviceModal({ mode, device, onClose, onSaved, token, onError }) {
  const isEdit = mode === "edit";
  const [name, setName] = useState(device?.name || "");
  const [location, setLocation] = useState(device?.location || "");
  const [kind, setKind] = useState(device?.kind || device?.type || "plug");
  const [externalId, setExternalId] = useState(device?.external_id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    onError("");

    if (!name.trim()) return onError("Device name is required.");

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || null,
        kind,
        external_id: externalId.trim() || null,
      };

      const saved = isEdit
        ? await updateDevice(token, device.id, payload)
        : await createDevice(token, payload);

      onSaved(saved);
    } catch (err) {
      onError(err.message || "Save failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit Device" : "Add Device"} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <label className="label" htmlFor="d_name">
          Name
        </label>
        <input id="d_name" className="input" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="label" htmlFor="d_location">
          Location
        </label>
        <input
          id="d_location"
          className="input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Kitchen"
        />

        <label className="label" htmlFor="d_kind">
          Type
        </label>
        <select id="d_kind" className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="plug">Smart Plug</option>
          <option value="meter">Energy Meter</option>
          <option value="sensor">Sensor</option>
        </select>

        <label className="label" htmlFor="d_external">
          External ID (optional)
        </label>
        <input
          id="d_external"
          className="input"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
          placeholder="vendor device id"
        />

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default DevicesPage;
