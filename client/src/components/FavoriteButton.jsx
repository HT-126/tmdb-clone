import {
  IconButton,
  Tooltip,
} from "@mui/material";

import FavoriteIcon from
  "@mui/icons-material/Favorite";

import FavoriteBorderIcon from
  "@mui/icons-material/FavoriteBorder";

import useFavorites from
  "../hooks/useFavorites";

function FavoriteButton({
  movie,
  sx,
}) {
  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const selected =
    isFavorite(movie.id);

  function handleClick(event) {
    // Prevent a card click from opening
    // the movie detail page.
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite(movie);
  }

  const label = selected
    ? "Remove from favorites"
    : "Add to favorites";

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={handleClick}
        sx={{
          color: selected
            ? "#e91e63"
            : "white",

          backgroundColor:
            "rgba(3, 37, 65, 0.85)",

          "&:hover": {
            backgroundColor:
              "rgba(3, 37, 65, 1)",
          },

          ...sx,
        }}
      >
        {selected ? (
          <FavoriteIcon />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default FavoriteButton;