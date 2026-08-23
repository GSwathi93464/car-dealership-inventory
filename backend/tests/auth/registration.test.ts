
import request from "supertest";
import app from "../../src/app";
import { pool } from "../../src/config/database";

describe("POST /api/auth/register", () => {
  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [
      "swathi@test.com",
    ]);

    await pool.end();
  });

  it("should register a new user and save it in database", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Swathi",
        email: "swathi@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(201);

    const result = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      ["swathi@test.com"]
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe("Swathi");
    expect(result.rows[0].email).toBe("swathi@test.com");
    expect(result.rows[0].password).not.toBe("Password123");
  });

  it("should not register a user with an existing email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another User",
        email: "swathi@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("Email already registered");
  });

  it("should reject registration when email is missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Swathi",
        email: "",
        password: "Password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });

  it("should reject registration when password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Swathi",
        email: "newuser@test.com",
        password: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });

  it("should reject registration when name is missing", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "",
        email: "name-test@test.com",
        password: "Password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Name, email and password are required"
    );
  });
});
