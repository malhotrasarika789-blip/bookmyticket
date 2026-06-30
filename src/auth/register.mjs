import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.mjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Registration successful!",
      user: result.rows[0]
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error); // 👈 IMPORTANT DEBUG
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

export default router;