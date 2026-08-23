import { pool } from "./config/database";

async function createCarsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        color VARCHAR(50) NOT NULL,
        mileage INTEGER NOT NULL,
        status VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Cars table created successfully");
  } catch (error) {
    console.error("Failed to create cars table:", error);
  } finally {
    await pool.end();
  }
}

createCarsTable();