import request from "supertest";
import app from "../../src/app";
import { pool } from "../../src/config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("GET /api/admin/users", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await pool.query(
      "DELETE FROM users WHERE email IN ($1, $2)",
      ["admin@test.com", "normaluser@test.com"]
    );

    const hashedPassword = await bcrypt.hash("Password123", 10);

    const adminResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [
        "Admin User",
        "admin@test.com",
        hashedPassword,
        "admin",
      ]
    );

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [
        "Normal User",
        "normaluser@test.com",
        hashedPassword,
        "user",
      ]
    );

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    adminToken = jwt.sign(
      {
        userId: adminResult.rows[0].id,
        email: adminResult.rows[0].email,
        role: adminResult.rows[0].role,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    userToken = jwt.sign(
      {
        userId: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM users WHERE email IN ($1, $2)",
      ["admin@test.com", "normaluser@test.com"]
    );

    await pool.end();
  });

  it("should allow admin to access users list", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("users");
  });

  it("should reject normal user from admin route", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Admin access required");
  });

  it("should reject request without token", async () => {
    const response = await request(app)
      .get("/api/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Access token required");
  });
});