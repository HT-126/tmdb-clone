import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../test/renderWithProviders";
import MovieCard from "./MovieCard";

const baseMovie = {
  id: 27205,
  title: "Inception",
  release_date: "2010-07-15",
  vote_average: 8.4,
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
};

describe("MovieCard", () => {
  it("shows the poster image when the movie has a poster", () => {
    renderWithProviders(<MovieCard movie={baseMovie} />);

    const poster = screen.getByRole("img", { name: "Inception" });
    expect(poster).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w342/poster.jpg",
    );
    expect(screen.queryByText("No poster")).not.toBeInTheDocument();
  });

  it("shows a placeholder when the movie has no poster", () => {
    renderWithProviders(
      <MovieCard movie={{ ...baseMovie, poster_path: null }} />,
    );

    expect(screen.getByText("No poster")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Inception" })).not.toBeInTheDocument();
  });

  it("links to the movie page and shows the title", () => {
    renderWithProviders(<MovieCard movie={baseMovie} />);

    const links = screen.getAllByRole("link");
    expect(links.every((link) => link.getAttribute("href") === "/movie/27205")).toBe(true);
    expect(screen.getByText("Inception")).toBeInTheDocument();
  });
});
