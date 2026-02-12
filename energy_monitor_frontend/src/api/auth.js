import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function login({ email, password }) {
  /** Login user. Backend endpoint may evolve; tries common paths. */
  try {
    return await apiRequest("/auth/login", { method: "POST", body: { email, password } });
  } catch (e1) {
    // fallback common variant
    return await apiRequest("/login", { method: "POST", body: { email, password } });
  }
}

// PUBLIC_INTERFACE
export async function register({ email, password, name }) {
  /** Register user. Backend endpoint may evolve; tries common paths. */
  try {
    return await apiRequest("/auth/register", { method: "POST", body: { email, password, name } });
  } catch (e1) {
    return await apiRequest("/register", { method: "POST", body: { email, password, name } });
  }
}

// PUBLIC_INTERFACE
export async function getMe(token) {
  /** Fetch current user profile. */
  try {
    return await apiRequest("/auth/me", { token });
  } catch (e1) {
    return await apiRequest("/me", { token });
  }
}
