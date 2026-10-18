import {
  Button,
  Stack,
  TextField,
} from "@mui/material";

import {
  useState,
} from "react";

function MovieSearch({
  initialValue = "",
  onSearch,
}) {
  const [keyword, setKeyword] =
    useState(initialValue);

  function handleSubmit(event) {
    event.preventDefault();

    onSearch(keyword.trim());
  }

  function handleClear() {
    setKeyword("");
    onSearch("");
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing={1}
      sx={{
        width: "100%",
      }}
    >
      <TextField
        fullWidth
        size="small"
        label="Search movies"
        placeholder="Enter a movie title..."
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
        }}
      />

      <Button
        type="submit"
        variant="contained"
        sx={{
          minWidth: 100,
        }}
      >
        Search
      </Button>

      {initialValue && (
        <Button
          type="button"
          variant="outlined"
          onClick={handleClear}
        >
          Clear
        </Button>
      )}
    </Stack>
  );
}

export default MovieSearch;