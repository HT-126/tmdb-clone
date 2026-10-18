import axios from "axios";
import { API_BASE_URL } from "../app/config";

// One shared client for our backend.
// withCredentials: the browser sends and stores the httpOnly login cookie.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Turn every failed request into an Error with a readable message
// and the HTTP status (so callers can tell 401 from 404).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    let message;
    if (typeof data?.error === "string") {
      // { error: "Movie not found" }
      message = data.error;
    } else if (Array.isArray(data?.errors) && data.errors.length) {
      // { errors: [zod issues] }
      message = data.errors[0].message;
    } else if (error.response) {
      message = `Request failed (${error.response.status})`;
    } else {
      message = "Unable to connect to the server";
    }

    const wrapped = new Error(message);
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  },
);

export default apiClient;
