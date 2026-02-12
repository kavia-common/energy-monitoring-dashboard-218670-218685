import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// PUBLIC_INTERFACE
function RequireAuth({ children }) {
  /** Protect routes by requiring authentication. */
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default RequireAuth;
