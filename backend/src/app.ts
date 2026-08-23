import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "./config/database";
import {
  authenticateToken,
  AuthRequest,
} from "./middleware/authMiddleware";
import { requireAdmin } from "./middleware/roleMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

// =====================================================
// PROFILE
// =====================================================

app.get(
  "/api/auth/profile",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, role
         FROM users
         WHERE id = $1`,
        [req.user?.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        user: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch profile",
      });
    }
  }
);

// =====================================================
// ADMIN - GET USERS
// =====================================================

app.get(
  "/api/admin/users",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY id`
      );

      return res.status(200).json({
        users: result.rows,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch users",
      });
    }
  }
);

// =====================================================
// CREATE CAR
// =====================================================

app.post(
  "/api/cars",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const {
        make,
        model,
        year,
        price,
        color,
        mileage,
        status,
      } = req.body;

      if (
        !make ||
        !model ||
        !year ||
        !price ||
        !color ||
        mileage === undefined
      ) {
        return res.status(400).json({
          message:
            "Make, model, year, price, color and mileage are required",
        });
      }

      const result = await pool.query(
        `INSERT INTO cars
         (make, model, year, price, color, mileage, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING
           id,
           make,
           model,
           year,
           price,
           color,
           mileage,
           status,
           created_at`,
        [
          make,
          model,
          year,
          price,
          color,
          mileage,
          status || "available",
        ]
      );

      return res.status(201).json({
        message: "Car created successfully",
        car: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to create car",
      });
    }
  }
);

// =====================================================
// GET ALL CARS
// =====================================================

app.get(
  "/api/cars",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const result = await pool.query(
        `SELECT
           id,
           make,
           model,
           year,
           price,
           color,
           mileage,
           status,
           created_at
         FROM cars
         ORDER BY id DESC`
      );

      return res.status(200).json({
        cars: result.rows,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to fetch cars",
      });
    }
  }
);

// =====================================================
// UPDATE CAR
// =====================================================

app.put(
  "/api/cars/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const {
        make,
        model,
        year,
        price,
        color,
        mileage,
        status,
      } = req.body;

      // First check whether the car exists
      const existingCar = await pool.query(
        `SELECT id
         FROM cars
         WHERE id = $1`,
        [id]
      );

      if (existingCar.rows.length === 0) {
        return res.status(404).json({
          message: "Car not found",
        });
      }

      // Update only the fields that are provided
      const result = await pool.query(
        `UPDATE cars
         SET
           make = COALESCE($1, make),
           model = COALESCE($2, model),
           year = COALESCE($3, year),
           price = COALESCE($4, price),
           color = COALESCE($5, color),
           mileage = COALESCE($6, mileage),
           status = COALESCE($7, status)
         WHERE id = $8
         RETURNING
           id,
           make,
           model,
           year,
           price,
           color,
           mileage,
           status,
           created_at`,
        [
          make,
          model,
          year,
          price,
          color,
          mileage,
          status,
          id,
        ]
      );

      return res.status(200).json({
        message: "Car updated successfully",
        car: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to update car",
      });
    }
  }
);
// =====================================================
// DELETE CAR
// =====================================================

app.delete(
  "/api/cars/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM cars
         WHERE id = $1
         RETURNING
           id,
           make,
           model,
           year,
           price,
           color,
           mileage,
           status,
           created_at`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Car not found",
        });
      }

      return res.status(200).json({
        message: "Car deleted successfully",
        car: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to delete car",
      });
    }
  }
);
export default app;