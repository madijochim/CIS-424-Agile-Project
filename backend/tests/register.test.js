const request = require("supertest");
const app = require("../src/app");

describe("POST /api/auth/register", () => {
  test("should return 400 when validation fails for empty fields", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "",
      password: "",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Validation failed.");
    expect(Array.isArray(response.body.fields)).toBe(true);
  });

  test("should return 400 for invalid email format", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "bad-email",
      password: "Password123",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Validation failed.");
  });
});
