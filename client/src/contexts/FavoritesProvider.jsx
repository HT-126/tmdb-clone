import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import useMe from "../hooks/useMe";

import {
  addFavorite as addFavoriteRequest,
  clearFavorites as clearFavoritesRequest,
  getFavorites,
  removeFavorite as removeFavoriteRequest,
} from "../services/favoriteService";

import FavoritesContext from "./favorites-context";

const NO_FAVORITES = [];

// Same public API as before (favorites, favoriteCount, isFavorite, addFavorite,
// removeFavorite, toggleFavorite, clearFavorites), but the data now lives on the server,
// per user, and TanStack Query owns it.
function FavoritesProvider({
  children,
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user } = useMe();

  const { data } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    // Only ask when somebody is logged in.
    enabled: Boolean(user),
  });

  const favorites = user
    ? (data ?? NO_FAVORITES)
    : NO_FAVORITES;

  // After every change (also a failed one), load the list again from the server.
  function refreshFavorites() {
    queryClient.invalidateQueries({
      queryKey: ["favorites"],
    });
  }

  const addMutation = useMutation({
    mutationFn: addFavoriteRequest,
    onSettled: refreshFavorites,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavoriteRequest,
    onSettled: refreshFavorites,
  });

  const clearMutation = useMutation({
    mutationFn: clearFavoritesRequest,
    onSettled: refreshFavorites,
  });

  // Logged out: send the user to the login page, and come back afterwards.
  function goToLogin() {
    navigate("/login", {
      state: { from: location },
    });
  }

  function isFavorite(movieId) {
    return favorites.some(
      (movie) =>
        movie.id === Number(movieId),
    );
  }

  function addFavorite(movie) {
    if (!user) {
      goToLogin();
      return;
    }

    addMutation.mutate(movie.id);
  }

  function removeFavorite(movieId) {
    if (!user) {
      goToLogin();
      return;
    }

    removeMutation.mutate(Number(movieId));
  }

  function toggleFavorite(movie) {
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id);
    } else {
      addFavorite(movie);
    }
  }

  function clearFavorites() {
    if (!user) {
      goToLogin();
      return;
    }

    clearMutation.mutate();
  }

  const contextValue = {
    favorites,
    favoriteCount: favorites.length,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider
      value={contextValue}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export default FavoritesProvider;
