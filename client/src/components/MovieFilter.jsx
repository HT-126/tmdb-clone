import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

function MovieFilter({
  genres,
  selectedGenreIds,
  onGenreToggle,
  onClear,
}) {
  const hasFilters =
    selectedGenreIds.length > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 2.5,
        borderRadius: 2,
      }}
    >
      <Stack spacing={2}>
        <Typography
          variant="h6"
          fontWeight={700}
        >
          Filters
        </Typography>

        <Divider />

        <Typography fontWeight={700}>
          Genres
        </Typography>

        <Stack
          direction="row"
          sx={{
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {genres.map((genre) => {
            const selected =
              selectedGenreIds.includes(
                genre.id,
              );

            return (
              <Chip
                key={genre.id}
                label={genre.name}
                clickable
                color={
                  selected
                    ? "primary"
                    : "default"
                }
                variant={
                  selected
                    ? "filled"
                    : "outlined"
                }
                onClick={() => {
                  onGenreToggle(
                    genre.id,
                  );
                }}
              />
            );
          })}
        </Stack>

        {hasFilters && (
          <Button
            variant="outlined"
            onClick={onClear}
          >
            Clear genres
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default MovieFilter;