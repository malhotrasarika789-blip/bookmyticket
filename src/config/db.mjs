import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log("DB connected successfully.");

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT,
        movie_id INT DEFAULT 1,
        seat_number INT NOT NULL,
        tier VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        booked_by VARCHAR(100),
        booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_movie_seat UNIQUE (movie_id, seat_number)
      );
    `);

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
  }
};

initializeDatabase();

export default pool;