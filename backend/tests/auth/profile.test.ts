import request from "supertest";
import app from "../../src/app";
import { pool } from "../../src/config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("GET /api/auth/profile", () => {
  let token: string;

  beforeAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [
      "profile@test.com",
    ]);

    const hashedPassword = await bcrypt.hash("Password123", 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [
        "Profile User",
        "profile@test.com",
        hashedPassword,
        "user",
      ]
    );

    const user = result.rows[0];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [
      "profile@test.com",
    ]);

    await pool.end();
  });

  it("should return user profile with valid token", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("profile@test.com");
  });

  it("should reject request without token", async () => {
    const response = await request(app)
      .get("/api/auth/profile");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Access token required");
  });

  it("should reject request with invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });
});