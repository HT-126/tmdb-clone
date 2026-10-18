import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  Link as RouterLink,
} from "react-router-dom";

import FavoriteButton from
  "./FavoriteButton";

import {
  formatDate,
  getImageUrl,
  getRatingPercentage,
} from "../utils";

function MovieCard({ movie }) {
  const posterUrl = getImageUrl(
    movie.poster_path,
  );

  const rating = getRatingPercentage(
    movie.vote_average,
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        overflow: "visible",
        backgroundColor:
          "transparent",
      }}
    >
      <Box
        sx={{
          position: "relative",
        }}
      >
        <CardActionArea
          component={RouterLink}
          to={`/movie/${movie.id}`}
          sx={{
            display: "block",
            borderRadius: 2,
          }}
        >
          {posterUrl ? (
            <Box
              component="img"
              src={posterUrl}
              alt={movie.title}
              sx={{
                width: "100%",
                aspectRatio: "2 / 3",
                objectFit: "cover",
                borderRadius: 2,
                backgroundColor:
                  "grey.200",
                boxShadow:
                  "0 3px 12px rgba(0,0,0,0.18)",
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
                backgroundColor:
                  "grey.300",
                color:
                  "text.secondary",
              }}
            >
              No poster
            </Box>
          )}
        </CardActionArea>

        <FavoriteButton
          movie={movie}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            left: 10,
            bottom: -20,
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            backgroundColor: "#081c22",
            border:
              "2px solid #081c22",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={rating}
            size={37}
            thickness={4}
            sx={{
              color:
                rating >= 70
                  ? "#21d07a"
                  : rating >= 40
                    ? "#d2d531"
                    : "#db2360",
            }}
          />

          <Typography
            component="span"
            sx={{
              position: "absolute",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {rating}

            <Box
              component="sup"
              sx={{
                fontSize: 6,
              }}
            >
              %
            </Box>
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          paddingTop: 3.5,
          paddingX: 0.5,

          "&:last-child": {
            paddingBottom: 1,
          },
        }}
      >
        <Stack spacing={0.4}>
          <Typography
            component={RouterLink}
            to={`/movie/${movie.id}`}
            variant="subtitle1"
            sx={{
              color: "text.primary",
              fontWeight: 700,
              lineHeight: 1.2,
              textDecoration: "none",

              "&:hover": {
                color: "#01b4e4",
              },
            }}
          >
            {movie.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatDate(
              movie.release_date,
            )}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MovieCard;