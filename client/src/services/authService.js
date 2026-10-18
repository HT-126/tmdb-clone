import apiClient from "../api/apiClient";

// GET /api/auth/me -> { id, email }, or null when nobody is logged in.
// The login cookie is httpOnly, so JavaScript can only ask the server who is logged in.
export async function getMe() {
  try {
    const response = await apiClient.get(
      "/api/auth/me",
    );

    return response.data;
  } catch (error) {
    // 401 is a normal answer here ("not logged in"), not a failure.
    if (error.status === 401) {
      return null;
    }

    throw error;
  }
}

// POST /api/auth/register -> 201 { id, email } and sets the cookie
export async function register({ email, password }) {
  const response = await apiClient.post(
    "/api/auth/register",
    { email, password },
  );

  return response.data;
}

// POST /api/auth/login -> 200 { id, email } and sets the cookie
export async function login({ email, password }) {
  const response = await apiClient.post(
    "/api/auth/login",
    { email, password },
  );

  return response.data;
}

// POST /api/auth/logout -> 204 and clears the cookie
export async function logout() {
  await apiClient.post("/api/auth/logout");
}
