import { Button, Container, Stack, Typography } from "@mui/material";

import { Link as RouterLink } from "react-router-dom";

function NotFoundPage() {
  return (
    <Container sx={{ py: 10 }}>
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
          }}
        >
          404
        </Typography>

        <Typography variant="h5">Page not found</Typography>

        <Button component={RouterLink} to="/" variant="contained">
          Return home
        </Button>
      </Stack>
    </Container>
  );
}

export default NotFoundPage;
