import { pool } from "./config/database";

async function checkAdmin() {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE email = $1",
      ["admin@test.com"]
    );

    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkAdmin();