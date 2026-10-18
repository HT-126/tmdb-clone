import apiClient from "../api/apiClient";

// GET /api/favorites -> array of movies (same fields as the movie list), newest added first
export async function getFavorites() {
  const response = await apiClient.get(
    "/api/favorites",
  );

  return response.data;
}

// PUT /api/favorites/:movieId -> 204, safe to repeat
export async function addFavorite(movieId) {
  await apiClient.put(
    `/api/favorites/${encodeURIComponent(movieId)}`,
  );
}

// DELETE /api/favorites/:movieId -> 204
export async function removeFavorite(movieId) {
  await apiClient.delete(
    `/api/favorites/${encodeURIComponent(movieId)}`,
  );
}

// DELETE /api/favorites -> 204, removes all favorites of the logged-in user
export async function clearFavorites() {
  await apiClient.delete("/api/favorites");
}
