import { useQuery } from "@tanstack/react-query";

import { getMovie } from "../services/movieService";

function useMovie(movieId) {
  return useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovie(movieId),
    enabled: Boolean(movieId),
  });
}

export default useMovie;
