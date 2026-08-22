import request from "supertest";
import app from "../../src/app";

describe("POST /api/auth/register", () => {
  it("should register a new user with valid details", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Swathi",
        email: "swathi@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");
  });
});