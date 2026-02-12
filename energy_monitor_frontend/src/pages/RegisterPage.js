import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// PUBLIC_INTERFACE
function RegisterPage() {
  /** Registration screen. */
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNote("");

    if (!email.trim()) return setError("Email is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setIsSubmitting(true);
    try {
      const res = await register({ email: email.trim(), password, name: name.trim() || undefined });
      if (isAuthenticated || res.access_token || res.token) {
        navigate("/app/dashboard");
      } else {
        setNote("Account created. Please login.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div className="main" style={{ maxWidth: 560, margin: "0 auto", paddingTop: 56 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Create Operator</div>
              <div className="card-subtitle">Provision your console access credentials.</div>
            </div>
          </div>
          <div className="card-body">
            {error ? <div className="alert alert-error">{error}</div> : null}
            {note ? <div className="alert alert-success">{note}</div> : null}

            <form onSubmit={onSubmit}>
              <label className="label" htmlFor="name">
                Name (optional)
              </label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Operator Name"
              />

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
                autoComplete="new-password"
                placeholder="min 6 chars"
              />

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Provisioning..." : "Register"}
                </button>
                <Link className="btn btn-ghost" to="/login">
                  Back to login
                </Link>
              </div>
            </form>

            <div className="small" style={{ marginTop: 12 }}>
              Your devices and data are isolated per account.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
