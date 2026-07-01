// CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import path from "path"; 

// Hitesh Sir ke original architecture imports
import pool from "./config/db.mjs";
import registerRouter from "./auth/register.mjs";
import { loginUser } from "./auth/login.mjs";
import { auth } from "./middleware/auth.mjs";

// Variables initialization (Hamesha route se pehle aayenge)
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;
const app = express();

// Middlewares setup
app.use(cors());
app.use(express.json());

// Main HTML Frontend Route (Safe parent path configuration)
app.get("/", (req, res) => {
  // Yeh line check karegi ki index.html project ke root directory mein hai ya nahi
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Auth Routes Pipeline mapping
app.use("/auth", registerRouter);
app.post("/login", loginUser);

// Get all theater seats matrix
app.get("/seats", async (req, res) => {
  try {
    const result = await pool.query("select * from seats order by id asc"); 
    res.send(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database fetching failed", details: err.message });
  }
});

// Safe endpoints for transaction booking
app.put("/seats/:id", auth, bookSeatHandler);
app.put("/:id", auth, bookSeatHandler);

// Database safe TRANSACTION implementation logic (FOR UPDATE lock)
async function bookSeatHandler(req, res) {
  let conn;
  try {
    const id = req.params.id;
    const name = req.user.email || req.user.name || "Authenticated User";
    
    conn = await pool.connect(); 
    await conn.query("BEGIN");
    
    // Row level lock to prevent race-conditions/double booking
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      return res.status(400).json({ error: "Seat already booked" });
    }
    
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1";
    await conn.query(sqlU, [id, name]); 

    await conn.query("COMMIT");
    conn.release();

    res.json({
      message: "Seat booked successfully",
      seatId: id,
      user: name
    });
  } catch (ex) {
    console.log(ex);
    if (conn) {
      await conn.query("ROLLBACK");
      conn.release();
    }
    res.status(500).json({ message: "Server error", error: ex.message });
  }
}

// System deployment listener startup
app.listen(port, () => console.log("🚀 Server successfully running on port: " + port));