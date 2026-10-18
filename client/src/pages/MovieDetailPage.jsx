import {
  Alert,
  Box,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import useMovie from "../hooks/useMovie";
import { formatDate, getImageUrl, getRatingPercentage } from "../utils";
import FavoriteButton from "../components/FavoriteButton";

function MovieDetailPage() {
  const { id } = useParams();
  const { data: movie, isPending: loading, error } = useMovie(id);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error.message}</Alert>
      </Container>
    );
  }

  if (!movie) {
    return null;
  }

  const posterUrl = getImageUrl(movie.poster_path, "w500");

  const backdropUrl = getImageUrl(movie.backdrop_path, "original");

  const rating = getRatingPercentage(movie.vote_average);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        color: "white",
        backgroundColor: "#10202c",
        backgroundImage: backdropUrl
          ? `
            linear-gradient(
              90deg,
              rgba(5, 18, 28, 0.97),
              rgba(5, 18, 28, 0.72)
            ),
            url("${backdropUrl}")
          `
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          paddingY: {
            xs: 4,
            md: 8,
          },
        }}
      >
        <Typography
          component={RouterLink}
          to="/movie"
          sx={{
            display: "inline-block",
            marginBottom: 3,
            color: "#6ce2c4",
            textDecoration: "none",
          }}
        >
          ← Back to movies
        </Typography>

        <Grid
          container
          spacing={5}
          sx={{
            alignItems: "center",
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            {posterUrl ? (
              <Box
                component="img"
                src={posterUrl}
                alt={movie.title}
                sx={{
                  width: "100%",
                  maxWidth: 380,
                  marginX: "auto",
                  borderRadius: 2,
                  boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "2 / 3",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  backgroundColor: "grey.700",
                }}
              >
                No poster
              </Box>
            )}
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 8,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: {
                  xs: 38,
                  md: 52,
                },
                fontWeight: 800,
              }}
            >
              {movie.title}

              {movie.release_date && (
                <Box
                  component="span"
                  sx={{
                    color: "grey.400",
                    fontWeight: 400,
                  }}
                >
                  {" "}
                  ({movie.release_date.slice(0, 4)})
                </Box>
              )}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              {formatDate(movie.release_date)}

              {movie.runtime ? ` • ${movie.runtime} minutes` : ""}

              {` • ${rating}% user score`}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                marginTop: 2,
                marginBottom: 2,
                alignItems: "center",
              }}
            >
              <FavoriteButton
                movie={movie}
                sx={{
                  position: "static",
                }}
              />

              <Typography>Save to favorites</Typography>
            </Stack>

            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                gap: 1,
                marginY: 2,
              }}
            >
              {movie.genres?.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  variant="outlined"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.45)",
                  }}
                />
              ))}
            </Stack>

            {movie.tagline && (
              <Typography
                sx={{
                  marginBottom: 2,
                  color: "grey.400",
                  fontStyle: "italic",
                }}
              >
                {movie.tagline}
              </Typography>
            )}

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Overview
            </Typography>

            <Typography
              sx={{
                fontSize: 17,
                lineHeight: 1.7,
              }}
            >
              {movie.overview || "No overview is available."}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MovieDetailPage;
