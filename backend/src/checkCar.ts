import request from "supertest";
import app from "./app";

async function checkCar() {
  try {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Password123",
      });

    console.log("LOGIN STATUS:", loginResponse.status);
    console.log("LOGIN BODY:", loginResponse.body);

    const token = loginResponse.body.token;

    const carResponse = await request(app)
      .post("/api/cars")
      .set("Authorization", `Bearer ${token}`)
      .send({
        make: "Toyota",
        model: "Camry",
        year: 2024,
        price: 28000,
        color: "White",
        mileage: 12000,
        status: "available",
      });

    console.log("CAR STATUS:", carResponse.status);
    console.log("CAR BODY:", carResponse.body);
  } catch (error) {
    console.error(error);
  }
}

checkCar();