import {
  Box,
  Button,
  Container,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getImageUrl,
} from "../../utils";

function HeroSection({
  featuredMovie,
}) {
  const [keyword, setKeyword] =
    useState("");

  const navigate = useNavigate();

  const backdropUrl =
    getImageUrl(
      featuredMovie?.backdrop_path,
      "original",
    );

  function handleSubmit(event) {
    event.preventDefault();

    const cleanKeyword =
      keyword.trim();

    if (!cleanKeyword) {
      return;
    }

    navigate(
      `/movie?query=${encodeURIComponent(
        cleanKeyword,
      )}`,
    );
  }

  return (
    <Box
      component="section"
      sx={{
        minHeight: {
          xs: 360,
          sm: 410,
          md: 450,
        },

        display: "flex",
        alignItems: "center",

        color: "white",
        backgroundColor: "#01b4e4",

        backgroundImage: backdropUrl
          ? `
            linear-gradient(
              90deg,
              rgba(1, 180, 228, 0.94),
              rgba(1, 180, 228, 0.60)
            ),
            url("${backdropUrl}")
          `
          : `
            linear-gradient(
              120deg,
              #01b4e4,
              #21d0b2
            )
          `,

        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            fontSize: {
              xs: 42,
              sm: 52,
              md: 58,
            },
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          Welcome.
        </Typography>

        <Typography
          variant="h4"
          sx={{
            marginTop: 1,
            marginBottom: {
              xs: 4,
              md: 5,
            },

            maxWidth: 950,

            fontSize: {
              xs: 21,
              sm: 25,
              md: 30,
            },

            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          Millions of movies to discover.
          Explore now.
        </Typography>

        <Stack
          component="form"
          onSubmit={handleSubmit}
          direction="row"
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: 999,
            backgroundColor: "white",
            boxShadow:
              "0 8px 24px rgba(0,0,0,0.16)",
          }}
        >
          <InputBase
            fullWidth
            value={keyword}
            onChange={(event) => {
              setKeyword(
                event.target.value,
              );
            }}
            placeholder="Search for a movie..."
            inputProps={{
              "aria-label":
                "Search for a movie",
            }}
            sx={{
              paddingX: {
                xs: 2,
                sm: 3,
              },
              paddingY: 1.2,
              fontSize: {
                xs: 15,
                sm: 17,
              },
              color: "text.primary",
            }}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              minWidth: {
                xs: 95,
                sm: 130,
              },

              borderRadius: 999,

              background:
                "linear-gradient(90deg, #1ed5a9, #01b4e4)",

              color: "white",

              "&:hover": {
                background:
                  "linear-gradient(90deg, #19bf98, #019bc5)",
              },
            }}
          >
            Search
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default HeroSection;