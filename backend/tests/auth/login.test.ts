import request from "supertest";
import app from "../../src/app";
import { pool } from "../../src/config/database";
import bcrypt from "bcrypt";

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [
      "login@test.com",
    ]);

    const hashedPassword = await bcrypt.hash("Password123", 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      [
        "Login User",
        "login@test.com",
        hashedPassword,
        "user",
      ]
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [
      "login@test.com",
    ]);

    await pool.end();
  });

  it("should login user with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should reject login with wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "WrongPassword",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should reject login when user does not exist", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should reject login when email or password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "",
        password: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Email and password are required"
    );
  });
});