import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { createQueryClient } from "../app/queryClient";
import FavoritesContext from "../contexts/favorites-context";

// A fake favorites value, so UI tests do not need the API.
export const fakeFavorites = {
  favorites: [],
  favoriteCount: 0,
  isFavorite: () => false,
  addFavorite: () => {},
  removeFavorite: () => {},
  toggleFavorite: () => {},
  clearFavorites: () => {},
};

// Render with a router, a fresh query cache, and the fake favorites.
export function renderWithProviders(ui, { route = "/" } = {}) {
  const queryClient = createQueryClient();
  // Do not retry failed requests in tests: an error should show up at once.
  queryClient.setDefaultOptions({ queries: { retry: false } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <FavoritesContext.Provider value={fakeFavorites}>
          {ui}
        </FavoritesContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
