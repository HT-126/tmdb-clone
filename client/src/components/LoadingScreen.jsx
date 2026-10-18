import {
  Box,
  CircularProgress,
} from "@mui/material";

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 8,
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default LoadingScreen;