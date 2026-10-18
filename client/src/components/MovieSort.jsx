import {
  MenuItem,
  TextField,
} from "@mui/material";

const sortOptions = [
  {
    value: "popularity.desc",
    label: "Popularity descending",
  },
  {
    value: "popularity.asc",
    label: "Popularity ascending",
  },
  {
    value: "vote_average.desc",
    label: "Rating descending",
  },
  {
    value: "vote_average.asc",
    label: "Rating ascending",
  },
  {
    value:
      "primary_release_date.desc",
    label: "Newest first",
  },
  {
    value:
      "primary_release_date.asc",
    label: "Oldest first",
  },
  {
    value: "title.asc",
    label: "Title A–Z",
  },
  {
    value: "title.desc",
    label: "Title Z–A",
  },
];

function MovieSort({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <TextField
      select
      size="small"
      label="Sort by"
      value={value}
      disabled={disabled}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      sx={{
        width: {
          xs: "100%",
          sm: 250,
        },
      }}
    >
      {sortOptions.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
        >
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default MovieSort;