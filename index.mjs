//  CREATE TABLE seats (
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
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "./middleware/auth.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "Aaaaaa@1",
  database: "sql_class_2_db",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

app.get("/test-db", async(req, res) => {
  const result = await pool.query("SELECT * FROM seats");
  res.json(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name", authMiddleware, async (req, res) => {
  //const conn = await pool.connect();
  const conn = await pool.connect(); // pick a connection from the pool
  try {
    const id = req.params.id;
    const name = req.params.name;
    // payment integration should be here
    // verify payment
    
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and is_booked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      return res.status(400).json({ message: "Seat already booked" });
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set is_booked = 1, name = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    await conn.query(
      "INSERT INTO bookings(user_id, seat_id) VALUES ($1, $2)",
      [req.user.userId, id]
    );
    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.json({message: "Seat boooked successfully"});
  } catch (ex) {
    console.log(ex);

    if (conn) {
      await conn.query("ROLLBACK");
    }

    res.status(500).json({message: "Booking failed"});
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password){
    return res.status(400).json({ message: "Email and password required"});
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully"});

  } catch (err) {
    res.status(400).json({message: "User already exists"});
  }
});

app.post ("/login", async (req, res) => {
  const { email, password } = req.body;

  try{
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0){
      return res.status(404).json({message: "User not found"});
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
      return res.status(400).json({message: "Invalid credentials"});
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({message: "Login failed"});
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));
