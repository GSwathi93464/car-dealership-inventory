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
        category,
        year,
        price,
        color,
        mileage,
        quantity,
        status,
      } = req.body;

      if (
        !make ||
        !model ||
        !category ||
        !year ||
        !price ||
        !color ||
        mileage === undefined ||
        quantity === undefined
      ) {
        return res.status(400).json({
          message:
            "Make, model, category, year, price, color, mileage and quantity are required",
        });
      }

      const result = await pool.query(
        `INSERT INTO cars
         (make, model, year, price, color, mileage, status, category, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING
           id,
           make,
           model,
           year,
           price,
           color,
           mileage,
           status,
           created_at,
           category,
           quantity`,
        [
          make,
          model,
          year,
          price,
          color,
          mileage,
          status || "available",
          category,
          quantity,
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
           category,
           year,
           price,
           color,
           mileage,
           quantity,
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
// SEARCH CARS
// =====================================================

app.get(
  "/api/cars/search",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        make,
        model,
        category,
        minPrice,
        maxPrice,
      } = req.query;

      const conditions: string[] = [];
      const values: any[] = [];

      if (make) {
        values.push(`%${make}%`);
        conditions.push(`make ILIKE $${values.length}`);
      }

      if (model) {
        values.push(`%${model}%`);
        conditions.push(`model ILIKE $${values.length}`);
      }

      if (category) {
        values.push(`%${category}%`);
        conditions.push(`category ILIKE $${values.length}`);
      }

      if (minPrice) {
        values.push(Number(minPrice));
        conditions.push(`price >= $${values.length}`);
      }

      if (maxPrice) {
        values.push(Number(maxPrice));
        conditions.push(`price <= $${values.length}`);
      }

      const whereClause =
        conditions.length > 0
          ? `WHERE ${conditions.join(" AND ")}`
          : "";

      const result = await pool.query(
        `SELECT
           id,
           make,
           model,
           category,
           year,
           price,
           color,
           mileage,
           quantity,
           status,
           created_at
         FROM cars
         ${whereClause}
         ORDER BY id DESC`,
        values
      );

      return res.status(200).json({
        cars: result.rows,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to search cars",
      });
    }
  }
);
// =====================================================
// PURCHASE CAR
// =====================================================

app.post(
  "/api/cars/:id/purchase",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE cars
         SET quantity = quantity - 1
         WHERE id = $1
           AND quantity > 0
         RETURNING
           id,
           make,
           model,
           category,
           year,
           price,
           color,
           mileage,
           quantity,
           status,
           created_at`,
        [id]
      );

      if (result.rows.length === 0) {
        const car = await pool.query(
          `SELECT id, quantity
           FROM cars
           WHERE id = $1`,
          [id]
        );

        if (car.rows.length === 0) {
          return res.status(404).json({
            message: "Car not found",
          });
        }

        return res.status(400).json({
          message: "Car is out of stock",
        });
      }

      return res.status(200).json({
        message: "Car purchased successfully",
        car: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Purchase failed",
      });
    }
  }
);
// =====================================================
// RESTOCK CAR - ADMIN ONLY
// =====================================================

app.post(
  "/api/cars/:id/restock",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (
        quantity === undefined ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message: "Quantity must be greater than 0",
        });
      }

      const result = await pool.query(
        `UPDATE cars
         SET quantity = quantity + $1
         WHERE id = $2
         RETURNING
           id,
           make,
           model,
           category,
           year,
           price,
           color,
           mileage,
           quantity,
           status,
           created_at`,
        [Number(quantity), id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Car not found",
        });
      }

      return res.status(200).json({
        message: "Car restocked successfully",
        car: result.rows[0],
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Restock failed",
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
  category,
  year,
  price,
  color,
  mileage,
  status,
  quantity,
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
     category = COALESCE($3, category),
     year = COALESCE($4, year),
     price = COALESCE($5, price),
     color = COALESCE($6, color),
     mileage = COALESCE($7, mileage),
     status = COALESCE($8, status),
     quantity = COALESCE($9, quantity)
   WHERE id = $10
   RETURNING
     id,
     make,
     model,
     category,
     year,
     price,
     color,
     mileage,
     status,
     quantity,
     created_at`,
  [
    make,
    model,
    category,
    year,
    price,
    color,
    mileage,
    status,
    quantity,
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
           category,
           year,
           price,
           color,
           mileage,
           status,
           quantity,
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