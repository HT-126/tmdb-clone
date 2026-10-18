import {
  Alert,
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import LoadingScreen from
  "../../components/LoadingScreen";

import MovieCard from
  "../../components/MovieCard";

function TrendingSection({
  movies,
  loading,
  error,
}) {
  return (
    <Box
      component="section"
      sx={{
        paddingY: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: 24,
              sm: 28,
            },
            fontWeight: 700,
            marginBottom: 3,
          }}
        >
          Popular
        </Typography>

        {loading && <LoadingScreen />}

        {!loading && error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {!loading &&
          !error &&
          movies.length === 0 && (
            <Alert severity="info">
              No popular movies found.
            </Alert>
          )}

        {!loading &&
          !error &&
          movies.length > 0 && (
            <Stack
              direction="row"
              spacing={2.5}
              sx={{
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: 3,
                paddingTop: 1,

                backgroundImage: `
                  linear-gradient(
                    to top,
                    rgba(32, 213, 184, 0.15),
                    transparent 45%
                  )
                `,

                scrollSnapType:
                  "x proximity",
              }}
            >
              {movies.map((movie) => (
                <Box
                  key={movie.id}
                  sx={{
                    width: {
                      xs: 145,
                      sm: 165,
                    },

                    minWidth: {
                      xs: 145,
                      sm: 165,
                    },

                    scrollSnapAlign:
                      "start",
                  }}
                >
                  <MovieCard
                    movie={movie}
                  />
                </Box>
              ))}
            </Stack>
          )}
      </Container>
    </Box>
  );
}

export default TrendingSection;