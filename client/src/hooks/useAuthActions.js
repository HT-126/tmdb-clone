import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/authService";

// Login, register and logout as mutations.
// After each one, the cached "me" and "favorites" data are updated.
function useAuthActions() {
  const queryClient = useQueryClient();

  function handleLoggedIn(user) {
    queryClient.setQueryData(["me"], user);
    queryClient.invalidateQueries({
      queryKey: ["favorites"],
    });
  }

  const login = useMutation({
    mutationFn: loginRequest,
    onSuccess: handleLoggedIn,
  });

  const register = useMutation({
    mutationFn: registerRequest,
    onSuccess: handleLoggedIn,
  });

  const logout = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      queryClient.removeQueries({
        queryKey: ["favorites"],
      });
    },
  });

  return { login, register, logout };
}

export default useAuthActions;
