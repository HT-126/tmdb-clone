import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { getMovies } from "../services/movieService";

// params: { page, sort, genre, q }. Each different set of params is cached separately.
function useMovies(params) {
  return useQuery({
    queryKey: ["movies", params],
    queryFn: () => getMovies(params),
    // Keep showing the old page while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export default useMovies;
