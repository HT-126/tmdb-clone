import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMe } from "../services/authService";
import { renderWithProviders } from "../test/renderWithProviders";
import RequireAuth from "./RequireAuth";

// Replace the API call; the guard, useMe and TanStack Query are real.
vi.mock("../services/authService");

function renderFavoritesRoute() {
  return renderWithProviders(
    <Routes>
      <Route
        path="/favorites"
        element={
          <RequireAuth>
            <p>Secret favorites</p>
          </RequireAuth>
        }
      />
      <Route path="/login" element={<p>Login page</p>} />
    </Routes>,
    { route: "/favorites" },
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sends a logged-out visitor to the login page", async () => {
    getMe.mockResolvedValue(null);

    renderFavoritesRoute();

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret favorites")).not.toBeInTheDocument();
  });

  it("shows the page to a logged-in user", async () => {
    getMe.mockResolvedValue({ id: 1, email: "me@example.com" });

    renderFavoritesRoute();

    expect(await screen.findByText("Secret favorites")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});
