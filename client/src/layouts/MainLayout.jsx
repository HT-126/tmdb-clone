import {
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import FavoriteIcon from
  "@mui/icons-material/Favorite";

import SearchIcon from
  "@mui/icons-material/Search";

import {
  Link as RouterLink,
  Outlet,
  useMatch,
  useNavigate,
} from "react-router-dom";

import useAuthActions from
  "../hooks/useAuthActions";

import useFavorites from
  "../hooks/useFavorites";

import useMe from "../hooks/useMe";

function MainLayout() {
  const { favoriteCount } =
    useFavorites();

  const { data: user } = useMe();
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  // The movie page is a full-width dark block, so the footer must touch it
  // (no white gap). Other pages keep the space above the footer.
  const isMovieDetailPage =
    useMatch("/movie/:id") !== null;

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  }

  return (
    <Stack
      sx={{
        minHeight: "100vh",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          backgroundColor: "#032541",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            spacing={{
              xs: 1,
              sm: 2,
              md: 3,
            }}
            sx={{
              minHeight: 70,
              alignItems: "center",
            }}
          >
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#6ce2c4",
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                TMDB
              </Typography>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                  width: 52,
                  height: 18,
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, #90cea1, #01b4e4)",
                }}
              />
            </Stack>

            <Button
              component={RouterLink}
              to="/movie"
              color="inherit"
            >
              Movies
            </Button>

            <Button
              component={RouterLink}
              to="/favorites"
              color="inherit"
              startIcon={
                <FavoriteIcon />
              }
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                },
              }}
            >
              Favorites
            </Button>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <IconButton
              component={RouterLink}
              to="/movie"
              color="inherit"
              aria-label="Search movies"
            >
              <SearchIcon
                sx={{
                  color: "#01b4e4",
                }}
              />
            </IconButton>

            <IconButton
              component={RouterLink}
              to="/favorites"
              color="inherit"
              aria-label={`${favoriteCount} favorite movies`}
            >
              <Badge
                badgeContent={
                  favoriteCount
                }
                color="error"
              >
                <FavoriteIcon />
              </Badge>
            </IconButton>

            {user ? (
              <>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    display: {
                      xs: "none",
                      md: "block",
                    },
                    maxWidth: 200,
                  }}
                >
                  {user.email}
                </Typography>

                <Button
                  color="inherit"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                >
                  Log in
                </Button>

                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "inline-flex",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          marginTop: isMovieDetailPage ? 0 : 6,
          padding: 3,
          textAlign: "center",
          backgroundColor: "#032541",
          color: "white",
        }}
      >
        <Typography variant="body2">
          This product uses the TMDB API
          but is not endorsed or certified
          by TMDB.
        </Typography>
      </Box>
    </Stack>
  );
}

export default MainLayout;