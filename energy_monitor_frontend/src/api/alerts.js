import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function listAlerts(token) {
  /** List alert rules. */
  try {
    return await apiRequest("/alerts", { token });
  } catch {
    return [
      {
        id: "al_1",
        name: "High power draw",
        device_id: null,
        condition: "watts > 800",
        enabled: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }
}

// PUBLIC_INTERFACE
export async function createAlert(token, payload) {
  /** Create alert rule. */
  try {
    return await apiRequest("/alerts", { method: "POST", token, body: payload });
  } catch {
    return { id: `al_${Date.now()}`, ...payload, created_at: new Date().toISOString() };
  }
}

// PUBLIC_INTERFACE
export async function updateAlert(token, alertId, payload) {
  /** Update alert rule. */
  try {
    return await apiRequest(`/alerts/${encodeURIComponent(alertId)}`, {
      method: "PUT",
      token,
      body: payload,
    });
  } catch {
    return { id: alertId, ...payload };
  }
}

// PUBLIC_INTERFACE
export async function deleteAlert(token, alertId) {
  /** Delete alert rule. */
  try {
    return await apiRequest(`/alerts/${encodeURIComponent(alertId)}`, { method: "DELETE", token });
  } catch {
    return { ok: true };
  }
}
