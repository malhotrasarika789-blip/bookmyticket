import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.mjs";

export const loginUser = async (req, res) => {
    try {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rowCount === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name }, 
        process.env.JWT_SECRET || 'ChaiAurSQLSecret', 
        { expiresIn: '2h' }
    );

    return res.status(200).json({
        message: `Welcome back, ${user.name}!`,
        token,
        user: { id: user.id, name: user.name, email: user.email }
    });

    } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};