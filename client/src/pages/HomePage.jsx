import HeroSection from
  "../sections/home/HeroSection";

import TrendingSection from
  "../sections/home/TrendingSection";

import useMovies from "../hooks/useMovies";

function HomePage() {
  // The most popular movies, first page.
  const { data, isPending, error } =
    useMovies({
      page: 1,
      sort: "popularity.desc",
    });

  const movies = data?.results ?? [];

  const featuredMovie =
    movies.find(
      (movie) =>
        movie.backdrop_path,
    );

  return (
    <>
      <HeroSection
        featuredMovie={
          featuredMovie
        }
      />

      <TrendingSection
        movies={movies}
        loading={isPending}
        error={error?.message ?? ""}
      />
    </>
  );
}

export default HomePage;
