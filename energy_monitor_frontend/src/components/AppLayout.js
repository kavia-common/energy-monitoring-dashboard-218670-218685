import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import HealthBadge from "./HealthBadge";

// PUBLIC_INTERFACE
function AppLayout() {
  /** Main authenticated app layout with sidebar and header. */
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="App">
      <div className="retro-shell">
        <aside className="sidebar" aria-label="Sidebar Navigation">
          <div className="brand">
            <div className="brand-badge" aria-hidden="true" />
            <div>
              <div className="brand-title">ENERGY//MON</div>
              <div className="brand-subtitle">retro telemetry console</div>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/app/dashboard">
              <span className="nav-icon">▣</span> Dashboard
            </NavLink>
            <NavLink to="/app/devices">
              <span className="nav-icon">⌁</span> Devices
            </NavLink>
            <NavLink to="/app/analytics">
              <span className="nav-icon">∆</span> Analytics
            </NavLink>
            <NavLink to="/app/alerts">
              <span className="nav-icon">!</span> Alerts
            </NavLink>
            <NavLink to="/app/settings">
              <span className="nav-icon">⚙</span> Settings
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="pill">
              USER: <strong>{user?.email || "unknown"}</strong>
            </div>
            <HealthBadge />
            <div className="split">
              <button className="btn btn-ghost" onClick={toggleTheme} type="button">
                THEME: <span className="mono">{theme}</span>
              </button>
              <button className="btn btn-danger" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
            <div className="small">
              Tip: open a device for <span className="kbd">real-time</span> + history charts.
            </div>
          </div>
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
