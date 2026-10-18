// Our own backend (Express + MySQL). Set VITE_API_BASE_URL in client/.env.
// VITE_* values are bundled into the browser code, so never put secrets here.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// Posters and backdrops are still served from TMDB's image host.
export const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p";
