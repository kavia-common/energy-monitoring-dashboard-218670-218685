/**
 * Lightweight API client for the Energy Monitor backend.
 * Uses fetch with JSON + Bearer auth token.
 */

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:3001";

function joinUrl(base, path) {
  if (!path) return base;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function parseJsonOrThrow(res) {
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;
  if (!res.ok) {
    const message =
      (data && (data.detail || data.message || data.error)) ||
      `${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// PUBLIC_INTERFACE
export async function apiRequest(path, { method = "GET", token, query, body, headers } = {}) {
  /**
   * Perform an HTTP request against the backend.
   * @param {string} path - URL path (e.g. "/devices")
   * @param {object} options - method, token, query, body, headers
   * @returns {Promise<any>} parsed JSON response
   */
  let url = joinUrl(API_BASE, path);

  if (query && typeof query === "object") {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      qs.set(k, String(v));
    });
    const s = qs.toString();
    if (s) url += (url.includes("?") ? "&" : "?") + s;
  }

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  let finalBody = undefined;
  if (body !== undefined && body !== null) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });

  return parseJsonOrThrow(res);
}
