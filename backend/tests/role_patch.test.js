const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const AuditLog = require("../src/models/AuditLog");

jest.mock("../src/models/User");
jest.mock("../src/models/AuditLog");

describe("PATCH /api/users/:id/role", () => {
  const targetId = "507f1f77bcf86cd799439099";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 403 when caller is not Admin", async () => {
    const token = jwt.sign(
      { sub: "507f1f77bcf86cd799439011", role: "Manager" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const res = await request(app)
      .patch(`/api/users/${targetId}/role`)
      .set("Cookie", [`token=${token}`])
      .send({ role: "Viewer" });

    expect(res.statusCode).toBe(403);
  });

  test("writes audit log and updates role for Admin", async () => {
    const actorId = "507f1f77bcf86cd799439011";
    const target = {
      _id: new mongoose.Types.ObjectId(targetId),
      role: "Viewer",
      save: jest.fn().mockResolvedValue(true),
    };

    let findCalls = 0;
    User.findById.mockImplementation(() => {
      findCalls += 1;
      if (findCalls === 1) {
        return Promise.resolve(target);
      }
      return {
        select: () =>
          Promise.resolve({
            _id: new mongoose.Types.ObjectId(targetId),
            role: "Manager",
            email: "user@example.com",
            name: "User",
          }),
      };
    });

    AuditLog.create.mockResolvedValue({});

    const token = jwt.sign(
      { sub: actorId, role: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    const res = await request(app)
      .patch(`/api/users/${targetId}/role`)
      .set("Cookie", [`token=${token}`])
      .send({ role: "Manager" });

    expect(res.statusCode).toBe(200);
    expect(AuditLog.create).toHaveBeenCalled();
    expect(target.role).toBe("Manager");
  });
});
