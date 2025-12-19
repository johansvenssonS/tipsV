// API configuration - auto-detects local vs production
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001"
    : "https://tipsv.onrender.com";

export { API_BASE };
