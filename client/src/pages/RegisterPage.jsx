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

function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const { register: registerUser } = useAuthActions();
  const { data: user } = useMe();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const backTo = from
    ? `${from.pathname}${from.search ?? ""}`
    : "/";

  if (user) {
    return <Navigate to={backTo} replace />;
  }

  function onSubmit(values) {
    registerUser.mutate(values, {
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
            Create account
          </Typography>

          {registerUser.error && (
            <Alert severity="error">
              {registerUser.error.message}
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
            autoComplete="new-password"
            required
            helperText="8 to 72 characters"
            slotProps={{
              htmlInput: {
                minLength: 8,
                maxLength: 72,
              },
            }}
            {...field("password")}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={registerUser.isPending}
          >
            Register
          </Button>

          <Typography variant="body2">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              state={location.state}
            >
              Log in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default RegisterPage;
