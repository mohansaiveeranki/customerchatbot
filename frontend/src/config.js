// Configuration helper to resolve dynamic backend API and WebSocket endpoints
// handles both single-service (monolith) and dual-service (frontend + backend split) deployments.

export const getApiUrl = (path) => {
  // If VITE_API_URL is configured (e.g. dual-service deployment), use it.
  // Otherwise, default to empty string which resolves as a relative URL (single-service or dev proxy).
  const apiBase = import.meta.env.VITE_API_URL || "";
  return `${apiBase}${path}`;
};

export const getWsUrl = (path) => {
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (apiBase) {
    // Convert absolute HTTP/HTTPS base URL to WS/WSS protocol
    const wsScheme = apiBase.startsWith("https") ? "wss://" : "ws://";
    const host = apiBase.replace(/^https?:\/\//, "");
    return `${wsScheme}${host}${path}`;
  }
  
  // Fallback to relative routing using current window host (single-service deployment)
  const wsScheme = window.location.protocol === "https:" ? "wss://" : "ws://";
  return `${wsScheme}${window.location.host}${path}`;
};
