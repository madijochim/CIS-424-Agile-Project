const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const Employee = require("../src/models/Employee");

jest.mock("../src/models/Employee");

describe("RBAC — GET /api/employees", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 401 without cookie", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.statusCode).toBe(401);
  });

  test("returns 403 for Viewer role", async () => {
    const token = jwt.sign(
      { sub: "507f1f77bcf86cd799439011", role: "Viewer" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const res = await request(app)
      .get("/api/employees")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });

  test("returns 200 for Manager role", async () => {
    Employee.find.mockReturnValue({
      sort: () => ({
        lean: () => Promise.resolve([]),
      }),
    });

    const token = jwt.sign(
      { sub: "507f1f77bcf86cd799439012", role: "Manager" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const res = await request(app)
      .get("/api/employees")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
