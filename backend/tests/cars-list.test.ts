import request from "supertest";
import app from "../src/app";
import { pool } from "../src/config/database";
import bcrypt from "bcrypt";

describe("GET /api/cars", () => {
  let token: string;

  beforeAll(async () => {
    // Create admin user for this test
    const hashedPassword = await bcrypt.hash("Password123", 10);

    await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET
         password = EXCLUDED.password,
         role = EXCLUDED.role`,
      [
        "Admin",
        "admin@test.com",
        hashedPassword,
        "admin",
      ]
    );

    // Login
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Password123",
      });

    expect(loginResponse.status).toBe(200);

    token = loginResponse.body.token;

    // Create test car
    await pool.query(
      `INSERT INTO cars
       (make, model, year, price, color, mileage, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        "Honda",
        "Civic",
        2023,
        25000,
        "Black",
        15000,
        "available",
      ]
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM cars WHERE make = $1 AND model = $2",
      ["Honda", "Civic"]
    );
  });

  it("should return all cars", async () => {
    const response = await request(app)
      .get("/api/cars")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("cars");
    expect(Array.isArray(response.body.cars)).toBe(true);
    expect(response.body.cars.length).toBeGreaterThan(0);
  });
});