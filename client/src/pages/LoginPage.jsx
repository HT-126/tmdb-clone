import {
  Alert,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useForm } from "react-hook-form";

import {
  Link as RouterLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import PasswordField from "../components/PasswordField";
import useAuthActions from "../hooks/useAuthActions";
import useMe from "../hooks/useMe";

function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuthActions();
  const { data: user } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  // RequireAuth and the favorite button send the user here with the page to return to.
  const from = location.state?.from;
  const backTo = from
    ? `${from.pathname}${from.search ?? ""}`
    : "/";

  // Already logged in: nothing to do here.
  if (user) {
    return <Navigate to={backTo} replace />;
  }

  function onSubmit(values) {
    login.mutate(values, {
      onSuccess: () => {
        navigate(backTo, { replace: true });
      },
    });
  }

  // react-hook-form gives us a ref; MUI TextField needs it as inputRef.
  function field(name) {
    const { ref, ...rest } = register(name);
    return { inputRef: ref, ...rest };
  }

  return (
    <Container
      maxWidth="xs"
      sx={{ paddingY: 6 }}
    >
      <Paper
        variant="outlined"
        sx={{ padding: 3 }}
      >
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2}
        >
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Log in
          </Typography>

          {login.error && (
            <Alert severity="error">
              {login.error.message}
            </Alert>
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            {...field("email")}
          />

          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            {...field("password")}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={login.isPending}
          >
            Log in
          </Button>

          <Typography variant="body2">
            No account yet?{" "}
            <Link
              component={RouterLink}
              to="/register"
              state={location.state}
            >
              Register
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default LoginPage;
