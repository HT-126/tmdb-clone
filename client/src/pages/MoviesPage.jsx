import {
  Alert,
  Box,
  Container,
  Grid,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";

import { useSearchParams } from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import MovieFilter from "../components/MovieFilter";
import MovieList from "../components/MovieList";
import MovieSearch from "../components/MovieSearch";
import MovieSort from "../components/MovieSort";

import useGenres from "../hooks/useGenres";
import useMovies from "../hooks/useMovies";

function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("query") || "";

  const genreParam = searchParams.get("genres") || "";

  const sortBy = searchParams.get("sort") || "popularity.desc";

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const selectedGenreIds = genreParam.split(",").filter(Boolean).map(Number);

  // Server data comes from TanStack Query. The URL stays the source of the filters.
  const {
    data: moviesData,
    isPending: loading,
    error: moviesError,
  } = useMovies({
    page,
    sort: sortBy,
    genre: genreParam || undefined,
    q: query || undefined,
  });

  const { data: genres = [] } = useGenres();

  const movies = moviesData?.results ?? [];

  const totalResults = moviesData?.total_results ?? 0;

  const totalPages = moviesData?.total_pages ?? 1;

  const error = moviesError?.message ?? "";

  function handleSearch(keyword) {
    const nextParams = new URLSearchParams();

    if (keyword) {
      nextParams.set("query", keyword);
    }

    setSearchParams(nextParams);
  }

  function handleGenreToggle(genreId) {
    const nextGenreIds = selectedGenreIds.includes(genreId)
      ? selectedGenreIds.filter((id) => id !== genreId)
      : [...selectedGenreIds, genreId];

    const nextParams = new URLSearchParams(searchParams);

    // Genre filtering uses Discover mode,
    // so remove keyword search.
    nextParams.delete("query");
    nextParams.delete("page");

    if (nextGenreIds.length) {
      nextParams.set("genres", nextGenreIds.join(","));
    } else {
      nextParams.delete("genres");
    }

    setSearchParams(nextParams);
  }

  function handleClearGenres() {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("genres");
    nextParams.delete("page");

    setSearchParams(nextParams);
  }

  function handleSortChange(newSortValue) {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("sort", newSortValue);

    nextParams.delete("page");

    setSearchParams(nextParams);
  }

  function handlePageChange(event, nextPage) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextPage === 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(nextPage));
    }

    setSearchParams(nextParams);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        paddingY: 4,
      }}
    >
      <Typography variant="h3" fontWeight={700} gutterBottom>
        {query ? `Search: ${query}` : "Discover Movies"}
      </Typography>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          marginBottom: 4,
        }}
      >
        <MovieSearch key={query} initialValue={query} onSearch={handleSearch} />

        <MovieSort
          value={sortBy}
          onChange={handleSortChange}
          disabled={Boolean(query)}
        />
      </Stack>

      <Grid container spacing={4}>
        <Grid
          size={{
            xs: 12,
            md: 3,
          }}
        >
          <Box
            sx={{
              position: {
                md: "sticky",
              },
              top: {
                md: 90,
              },
            }}
          >
            <MovieFilter
              genres={genres}
              selectedGenreIds={selectedGenreIds}
              onGenreToggle={handleGenreToggle}
              onClear={handleClearGenres}
            />
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 9,
          }}
        >
          {!loading && !error && (
            <Typography
              color="text.secondary"
              sx={{
                marginBottom: 2,
              }}
            >
              {totalResults.toLocaleString()}
              {" movies found"}
            </Typography>
          )}

          {loading && <LoadingScreen />}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && <MovieList movies={movies} />}

          {!loading && !error && totalPages > 1 && (
            <Stack
              sx={{
                marginTop: 5,
                alignItems: "center",
              }}
            >
              <Pagination
                page={page}
                count={totalPages}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
                onChange={handlePageChange}
              />
            </Stack>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default MoviesPage;
