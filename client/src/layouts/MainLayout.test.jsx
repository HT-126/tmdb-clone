import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMe } from "../services/authService";
import { renderWithProviders } from "../test/renderWithProviders";
import MainLayout from "./MainLayout";

vi.mock("../services/authService");

function renderLayoutAt(route) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="movie" element={<p>Movie list</p>} />
        <Route path="movie/:id" element={<p>Movie detail</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe("MainLayout footer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getMe.mockResolvedValue(null);
  });

  it("touches the page on the movie detail route (no white gap)", async () => {
    renderLayoutAt("/movie/27205");

    await screen.findByText("Movie detail");
    expect(getComputedStyle(screen.getByRole("contentinfo")).marginTop).toBe("0px");
  });

  it("keeps the space above the footer on other pages", async () => {
    renderLayoutAt("/movie");

    await screen.findByText("Movie list");
    expect(getComputedStyle(screen.getByRole("contentinfo")).marginTop).toBe("48px");
  });
});
