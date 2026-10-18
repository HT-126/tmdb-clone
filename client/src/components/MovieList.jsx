import {
  Alert,
  Grid,
} from "@mui/material";

import MovieCard from "./MovieCard";

function MovieList({ movies }) {
  if (!movies.length) {
    return (
      <Alert severity="info">
        No movies found.
      </Alert>
    );
  }

  return (
    <Grid
      container
      spacing={3}
    >
      {movies.map((movie) => (
        <Grid
          key={movie.id}
          size={{
            xs: 6,
            sm: 4,
            md: 3,
            lg: 2.4,
          }}
        >
          <MovieCard movie={movie} />
        </Grid>
      ))}
    </Grid>
  );
}

export default MovieList;