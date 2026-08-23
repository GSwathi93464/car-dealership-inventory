import bcrypt from "bcrypt";
import { pool } from "./config/database";

async function createAdmin() {
  try {
    const password = "Password123";

    const hashedPassword = await bcrypt.hash(password, 10);

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

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();