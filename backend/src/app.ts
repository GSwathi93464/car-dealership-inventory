import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/auth/register", (req, res) => {
  res.status(201).json({
    message: "User registered successfully",
    user: {
      name: req.body.name,
      email: req.body.email,
    },
  });
});

export default app;