import { useQuery } from "@tanstack/react-query";

import { getMe } from "../services/authService";

// Who is logged in: { id, email }, or null. TanStack Query owns this, not Zustand or localStorage.
function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}

export default useMe;
