import { useQuery } from "@tanstack/react-query";

import { getGenres } from "../services/movieService";

// The genre list never changes while the app runs.
function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: Infinity,
  });
}

export default useGenres;
