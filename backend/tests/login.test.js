const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const User = require("../src/models/User");

jest.mock("../src/models/User");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns generic error when user is not found", async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post("/api/auth/login").send({
      email: "none@example.com",
      password: "secret",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password.");
  });

  test("returns generic error when password does not match", async () => {
    User.findOne.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      email: "a@b.com",
      password: "hashed",
      role: "Viewer",
    });
    const cmp = jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "a@b.com",
      password: "wrong",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password.");
    cmp.mockRestore();
  });

  test("sets HTTP-only cookie and returns user on success", async () => {
    User.findOne.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      email: "a@b.com",
      name: "Alice",
      password: "hashed",
      role: "Manager",
    });
    const cmp = jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

    const res = await request(app).post("/api/auth/login").send({
      email: "a@b.com",
      password: "correct",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.role).toBe("Manager");
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie.some((c) => c.startsWith("token="))).toBe(true);
    expect(setCookie.some((c) => /httponly/i.test(c))).toBe(true);

    cmp.mockRestore();
  });
});
