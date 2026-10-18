import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGenres, getMovies } from "../services/movieService";
import { renderWithProviders } from "../test/renderWithProviders";
import MoviesPage from "./MoviesPage";

// Replace the API calls; the page, hooks and TanStack Query are real.
vi.mock("../services/movieService");

const page = {
  page: 1,
  total_pages: 1,
  total_results: 2,
  results: [
    { id: 1, title: "Inception", release_date: "2010-07-15", vote_average: 8.4, poster_path: "/a.jpg" },
    { id: 2, title: "Amélie", release_date: "2001-04-25", vote_average: 7.9, poster_path: null },
  ],
};

describe("MoviesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getGenres.mockResolvedValue([{ id: 28, name: "Action" }]);
  });

  it("shows the movies, the count, and the genre filter", async () => {
    getMovies.mockResolvedValue(page);

    renderWithProviders(<MoviesPage />, { route: "/movie" });

    expect(await screen.findByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Amélie")).toBeInTheDocument();
    expect(screen.getByText("2 movies found")).toBeInTheDocument();
    expect(screen.getByText("No poster")).toBeInTheDocument(); // Amélie has no poster
    expect(await screen.findByText("Action")).toBeInTheDocument();
  });

  it("sends the URL filters to the API", async () => {
    getMovies.mockResolvedValue(page);

    renderWithProviders(<MoviesPage />, {
      route: "/movie?genres=28,12&sort=vote_average.desc&page=2",
    });

    await screen.findByText("Inception");
    expect(getMovies).toHaveBeenCalledWith({
      page: 2,
      sort: "vote_average.desc",
      genre: "28,12",
      q: undefined,
    });
  });

  it("shows the error message when the request fails", async () => {
    getMovies.mockRejectedValue(Object.assign(new Error("Unable to connect to the server"), { status: 500 }));

    renderWithProviders(<MoviesPage />, { route: "/movie" });

    expect(await screen.findByText("Unable to connect to the server")).toBeInTheDocument();
  });
});
