import { pool } from "./config/database";

async function checkTables() {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name",
      ["public"]
    );

    console.log(result.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkTables();