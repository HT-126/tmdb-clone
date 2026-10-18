import {
  Alert,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import {
  Link as RouterLink,
} from "react-router-dom";

import MovieList from
  "../components/MovieList";

import useFavorites from
  "../hooks/useFavorites";

function FavoritesPage() {
  const {
    favorites,
    clearFavorites,
  } = useFavorites();

  return (
    <Container
      maxWidth="lg"
      sx={{
        paddingY: 4,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          justifyContent:
            "space-between",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={700}
        >
          Favorite Movies
        </Typography>

        {favorites.length > 0 && (
          <Button
            color="error"
            variant="outlined"
            onClick={clearFavorites}
          >
            Clear all
          </Button>
        )}
      </Stack>

      {favorites.length ? (
        <MovieList
          movies={favorites}
        />
      ) : (
        <Alert severity="info">
          You have no favorite movies yet.{" "}

          <Button
            component={RouterLink}
            to="/movie"
            size="small"
          >
            Discover movies
          </Button>
        </Alert>
      )}
    </Container>
  );
}

export default FavoritesPage;