const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/authRoutes");

describe("POST /api/auth/register", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
  });

  test("should return 400 when required fields are missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "",
        password: "",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Name, email, and password are required.");
  });

  test("should return 400 for invalid email format", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "bad-email",
        password: "Password123",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Please enter a valid email address.");
  });
});