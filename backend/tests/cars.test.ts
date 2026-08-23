import request from "supertest";
import app from "../src/app";
import { pool } from "../src/config/database";
import bcrypt from "bcrypt";

describe("POST /api/cars", () => {
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
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM cars WHERE make = $1 AND model = $2",
      ["Toyota", "Camry"]
    );
  });

  it("should create a car with valid details", async () => {
    const response = await request(app)
      .post("/api/cars")
      .set("Authorization", `Bearer ${token}`)
      .send({
  make: "Toyota",
  model: "Camry",
  category: "SUV",
  year: 2024,
  price: 28000,
  color: "White",
  mileage: 12000,
  quantity: 5,
  status: "available",
});

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("car");
    expect(response.body.car.make).toBe("Toyota");
    expect(response.body.car.model).toBe("Camry");
  });
});