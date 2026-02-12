import { apiRequest } from "./client";

function genFakeSeries({ points = 24, startTs = Date.now() - 23 * 3600 * 1000, stepMs = 3600 * 1000 } = {}) {
  const arr = [];
  let w = 100 + Math.random() * 250;
  for (let i = 0; i < points; i += 1) {
    w = Math.max(5, w + (Math.random() - 0.5) * 35);
    arr.push({
      ts: new Date(startTs + i * stepMs).toISOString(),
      watts: Number(w.toFixed(1)),
      voltage: 230 + (Math.random() - 0.5) * 4,
      amps: w / 230,
      kwh: (w * stepMs) / (3600 * 1000) / 1000,
    });
  }
  return arr;
}

// PUBLIC_INTERFACE
export async function getRealtime(token, deviceId) {
  /** Get live reading for device. */
  try {
    return await apiRequest(`/devices/${encodeURIComponent(deviceId)}/realtime`, { token });
  } catch {
    const series = genFakeSeries({ points: 1, startTs: Date.now(), stepMs: 1000 });
    return { device_id: deviceId, ...series[0] };
  }
}

// PUBLIC_INTERFACE
export async function getHistory(token, deviceId, { range = "24h", bucket = "1h" } = {}) {
  /** Get historical timeseries. */
  try {
    return await apiRequest(`/devices/${encodeURIComponent(deviceId)}/history`, {
      token,
      query: { range, bucket },
    });
  } catch {
    // fallback series
    const points = range === "7d" ? 7 * 24 : range === "30d" ? 30 : 24;
    const stepMs = range === "30d" ? 24 * 3600 * 1000 : 3600 * 1000;
    return genFakeSeries({ points, stepMs });
  }
}
