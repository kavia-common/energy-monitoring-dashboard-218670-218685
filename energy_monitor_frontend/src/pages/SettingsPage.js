import React from "react";
import { useAuth } from "../hooks/useAuth";

// PUBLIC_INTERFACE
function SettingsPage() {
  /** Settings view. */
  const { user } = useAuth();

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h1>Settings</h1>
          <p>Environment + session diagnostics.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Session</div>
              <div className="card-subtitle">Current logged-in user data.</div>
            </div>
          </div>
          <div className="card-body">
            <div className="alert">
              <div className="small">User</div>
              <div className="mono" style={{ marginTop: 8 }}>
                {JSON.stringify(user || {}, null, 2)}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Connectivity</div>
              <div className="card-subtitle">Frontend uses these environment variables.</div>
            </div>
          </div>
          <div className="card-body">
            <table className="table" aria-label="Environment table">
              <tbody>
                <tr>
                  <th>REACT_APP_API_BASE</th>
                  <td className="mono">{process.env.REACT_APP_API_BASE}</td>
                </tr>
                <tr>
                  <th>REACT_APP_BACKEND_URL</th>
                  <td className="mono">{process.env.REACT_APP_BACKEND_URL}</td>
                </tr>
                <tr>
                  <th>REACT_APP_WS_URL</th>
                  <td className="mono">{process.env.REACT_APP_WS_URL}</td>
                </tr>
                <tr>
                  <th>HEALTH PATH</th>
                  <td className="mono">{process.env.REACT_APP_HEALTHCHECK_PATH}</td>
                </tr>
              </tbody>
            </table>

            <div className="small" style={{ marginTop: 10 }}>
              Note: WebSocket real-time streaming UI will appear once backend exposes a WS endpoint.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
