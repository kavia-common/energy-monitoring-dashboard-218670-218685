import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
function NotFoundPage() {
  /** 404 route. */
  return (
    <div className="App">
      <div className="main" style={{ maxWidth: 720, margin: "0 auto", paddingTop: 56 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">404</div>
              <div className="card-subtitle">Signal lost in the void.</div>
            </div>
          </div>
          <div className="card-body">
            <div className="alert">Route not found.</div>
            <div className="form-actions">
              <Link className="btn btn-primary" to="/app/dashboard">
                Go to dashboard
              </Link>
              <Link className="btn btn-ghost" to="/login">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
