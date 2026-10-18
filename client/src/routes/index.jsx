import { Route, Routes } from "react-router-dom";

import RequireAuth from "../components/RequireAuth";

import MainLayout from "../layouts/MainLayout";

import FavoritesPage from "../pages/FavoritesPage";

import HomePage from "../pages/HomePage";

import LoginPage from "../pages/LoginPage";

import MoviesPage from "../pages/MoviesPage";

import MovieDetailPage from "../pages/MovieDetailPage";

import NotFoundPage from "../pages/NotFoundPage";

import RegisterPage from "../pages/RegisterPage";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route path="movie" element={<MoviesPage />} />

        <Route path="movie/:id" element={<MovieDetailPage />} />

        <Route path="login" element={<LoginPage />} />

        <Route path="register" element={<RegisterPage />} />

        <Route
          path="favorites"
          element={
            <RequireAuth>
              <FavoritesPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default Router;
