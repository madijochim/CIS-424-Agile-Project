import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

describe("App shell", () => {
  test("register route renders registration heading", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  test("login route renders sign in heading", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });
});
