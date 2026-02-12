import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// PUBLIC_INTERFACE
function LoginPage() {
  /** Login screen. */
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required.");
    if (!password) return setError("Password is required.");

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div className="main" style={{ maxWidth: 520, margin: "0 auto", paddingTop: 56 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Access Console</div>
              <div className="card-subtitle">Authenticate to manage your devices & energy data.</div>
            </div>
          </div>
          <div className="card-body">
            {error ? <div className="alert alert-error">{error}</div> : null}

            <form onSubmit={onSubmit}>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@domain.com"
              />

              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Connecting..." : "Login"}
                </button>
                <Link className="btn btn-ghost" to="/register">
                  Create account
                </Link>
              </div>
            </form>

            <div className="small" style={{ marginTop: 12 }}>
              Backend: <span className="kbd">{process.env.REACT_APP_API_BASE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
