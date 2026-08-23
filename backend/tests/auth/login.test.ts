import request from "supertest";
import app from "../../src/app";

describe("POST /api/auth/login", () => {
  it("should login user with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
  });
});