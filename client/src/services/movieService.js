import apiClient from "../api/apiClient";

// GET /api/movies -> { page, results, total_pages, total_results }
// genre is a comma-separated list of genre ids ("28,12"); a movie needs all of them.
export async function getMovies({
  page = 1,
  sort,
  genre,
  q,
} = {}) {
  const response = await apiClient.get(
    "/api/movies",
    {
      // axios leaves out undefined values
      params: {
        page,
        sort,
        genre: genre || undefined,
        q: q || undefined,
      },
    },
  );

  return response.data;
}

// GET /api/movies/:id -> movie with genres: [{ id, name }]
export async function getMovie(movieId) {
  const response = await apiClient.get(
    `/api/movies/${encodeURIComponent(movieId)}`,
  );

  return response.data;
}

// GET /api/genres -> [{ id, name }]
export async function getGenres() {
  const response = await apiClient.get(
    "/api/genres",
  );

  return response.data;
}
