const request = require("supertest");
const app = require("../src/app");

describe("404 handling", () => {
  test("returns JSON 404 for unknown API path", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Not found.");
  });
});
