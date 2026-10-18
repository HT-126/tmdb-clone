import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

// Do not retry client mistakes (404, 401, 400): the answer will not change.
function shouldRetry(failureCount, error) {
  if (error?.status >= 400 && error?.status < 500) {
    return false;
  }

  return failureCount < 2;
}

export function createQueryClient() {
  // The login cookie lasts 7 days. If the server answers 401 to any request, the session is
  // gone (expired, logged out in another tab, user deleted), so forget the cached user.
  // Then RequireAuth sends the visitor to /login and the header shows Log in again.
  // (getMe turns its own 401 into null, so it never reaches here.)
  function handleError(error) {
    if (error?.status === 401) {
      client.setQueryData(["me"], null);
    }
  }

  const client = new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  return client;
}

export const queryClient = createQueryClient();
