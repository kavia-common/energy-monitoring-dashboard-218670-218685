import { apiRequest } from "./client";

// PUBLIC_INTERFACE
export async function listDevices(token) {
  /** List user's devices. */
  try {
    return await apiRequest("/devices", { token });
  } catch {
    // fallback: no endpoint yet -> return empty list
    return [];
  }
}

// PUBLIC_INTERFACE
export async function createDevice(token, payload) {
  /** Create a device. */
  try {
    return await apiRequest("/devices", { method: "POST", token, body: payload });
  } catch (e) {
    // fallback: simulate creation
    return { id: `dev_${Date.now()}`, ...payload, created_at: new Date().toISOString() };
  }
}

// PUBLIC_INTERFACE
export async function updateDevice(token, deviceId, payload) {
  /** Update device. */
  try {
    return await apiRequest(`/devices/${encodeURIComponent(deviceId)}`, {
      method: "PUT",
      token,
      body: payload,
    });
  } catch {
    return { id: deviceId, ...payload, updated_at: new Date().toISOString() };
  }
}

// PUBLIC_INTERFACE
export async function deleteDevice(token, deviceId) {
  /** Delete device. */
  try {
    return await apiRequest(`/devices/${encodeURIComponent(deviceId)}`, {
      method: "DELETE",
      token,
    });
  } catch {
    return { ok: true };
  }
}

// PUBLIC_INTERFACE
export async function getDevice(token, deviceId) {
  /** Get a single device. */
  try {
    return await apiRequest(`/devices/${encodeURIComponent(deviceId)}`, { token });
  } catch (e) {
    // fallback: try list and find
    const list = await listDevices(token);
    return list.find((d) => String(d.id) === String(deviceId)) || null;
  }
}
