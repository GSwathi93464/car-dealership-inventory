import request from "supertest";
import app from "../src/app";
import { pool } from "../src/config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("DELETE /api/cars/:id", () => {
  let token: string;
  let carId: number;

  const adminEmail = "delete-admin@test.com";

  beforeAll(async () => {
    // Clean test admin if it already exists
    await pool.query(
      "DELETE FROM users WHERE email = $1",
      [adminEmail]
    );

    // Create separate admin for this test suite
    const hashedPassword = await bcrypt.hash(
      "Password123",
      10
    );

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role`,
      [
        "Delete Admin",
        adminEmail,
        hashedPassword,
        "admin",
      ]
    );

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    token = jwt.sign(
      {
        userId: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    // Create test car
    const carResponse = await request(app)
      .post("/api/cars")
      .set("Authorization", `Bearer ${token}`)
      .send({
  make: "Toyota",
  model: "Camry",
  category: "sedan",
  year: 2024,
  price: 28000,
  color: "White",
  mileage: 12000,
  quantity: 1,
  status: "available",
});

    expect(carResponse.status).toBe(201);

    carId = carResponse.body.car.id;
  });

  afterAll(async () => {
    // Cleanup car
    if (carId) {
      await pool.query(
        "DELETE FROM cars WHERE id = $1",
        [carId]
      );
    }

    // Cleanup test admin
    await pool.query(
      "DELETE FROM users WHERE email = $1",
      [adminEmail]
    );

    await pool.end();
  });

  it("should delete a car with valid authentication", async () => {
    const response = await request(app)
      .delete(`/api/cars/${carId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Car deleted successfully"
    );

    expect(response.body).toHaveProperty("car");

    expect(response.body.car.id).toBe(carId);
  });

  it("should reject delete without authentication", async () => {
    const response = await request(app)
      .delete(`/api/cars/${carId}`);

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Access token required"
    );
  });

  it("should return 404 when car does not exist", async () => {
    const response = await request(app)
      .delete("/api/cars/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Car not found"
    );
  });
});