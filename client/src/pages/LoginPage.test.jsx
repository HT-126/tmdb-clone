import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getMe, login } from "../services/authService";
import { renderWithProviders } from "../test/renderWithProviders";
import LoginPage from "./LoginPage";

// Replace the API calls; the form, hooks and TanStack Query are real.
vi.mock("../services/authService");

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>Home page</p>} />
    </Routes>,
    { route: "/login" },
  );
}

async function fillAndSubmit(email, password) {
  // Wait until the page knows nobody is logged in.
  fireEvent.change(await screen.findByLabelText(/email/i), {
    target: { value: email },
  });
  // /^password/ does not match the "Show password" button.
  fireEvent.change(screen.getByLabelText(/^password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getMe.mockResolvedValue(null);
  });

  it("shows and hides the password with the eye button", async () => {
    renderLogin();

    const input = await screen.findByLabelText(/^password/i);
    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("shows the server error when the login fails", async () => {
    login.mockRejectedValue(
      Object.assign(new Error("Invalid email or password"), { status: 401 }),
    );

    renderLogin();
    await fillAndSubmit("me@example.com", "wrong-password");

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    expect(screen.queryByText("Home page")).not.toBeInTheDocument();
  });

  it("sends the form values and leaves the page after a successful login", async () => {
    login.mockResolvedValue({ id: 1, email: "me@example.com" });

    renderLogin();
    await fillAndSubmit("me@example.com", "password123");

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(login.mock.calls[0][0]).toEqual({
      email: "me@example.com",
      password: "password123",
    });
  });
});
