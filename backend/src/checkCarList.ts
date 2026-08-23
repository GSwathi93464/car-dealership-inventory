import request from "supertest";
import app from "./app";

async function checkCarList() {
  try {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Password123",
      });

    console.log("LOGIN STATUS:", loginResponse.status);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/cars")
      .set("Authorization", `Bearer ${token}`);

    console.log("CAR LIST STATUS:", response.status);
    console.log("CAR LIST BODY:", response.body);
  } catch (error) {
    console.error(error);
  }
}

checkCarList();