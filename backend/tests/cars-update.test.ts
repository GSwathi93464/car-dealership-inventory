import request from "supertest";
import app from "../src/app";
import { pool } from "../src/config/database";
import bcrypt from "bcrypt";

describe("PUT /api/cars/:id", () => {
  let token: string;
  let carId: number;

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

    // Login as admin
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Password123",
      });

    expect(loginResponse.status).toBe(200);

    token = loginResponse.body.token;

    // Create a car for testing
    const carResponse = await request(app)
      .post("/api/cars")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "sedan",
        year: 2023,
        price: 25000,
        color: "Black",
        mileage: 15000,
        quantity: 5,
        status: "available",
      });

    expect(carResponse.status).toBe(201);

    carId = carResponse.body.car.id;
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM cars WHERE id = $1",
      [carId]
    );
  });

  it("should update a car with valid details", async () => {
    const response = await request(app)
      .put(`/api/cars/${carId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Honda",
        model: "Civic",
        category: "sedan",
        year: 2024,
        price: 27000,
        color: "White",
        mileage: 10000,
        quantity: 5,
        status: "sold",
      });

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("car");

    expect(response.body.car.id).toBe(carId);
    expect(response.body.car.make).toBe("Honda");
    expect(response.body.car.model).toBe("Civic");
    expect(response.body.car.year).toBe(2024);
    expect(response.body.car.price).toBe("27000.00");
    expect(response.body.car.color).toBe("White");
    expect(response.body.car.mileage).toBe(10000);
    expect(response.body.car.status).toBe("sold");
  });

  it("should reject update without authentication", async () => {
    const response = await request(app)
      .put(`/api/cars/${carId}`)
      .send({
        price: 30000,
      });

    expect(response.status).toBe(401);

    expect(response.body.message).toBe(
      "Access token required"
    );
  });

  it("should return 404 when car does not exist", async () => {
    const response = await request(app)
      .put("/api/cars/999999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        price: 30000,
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Car not found"
    );
  });
});