import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log("DB PASSWORD connected successfully.");

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
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                movie_id INT DEFAULT 1,
                seat_number INT NOT NULL,
                tier VARCHAR(50) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                booked_by VARCHAR(100),
                booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_movie_seat UNIQUE (movie_id, seat_number)
            );
        `);

        console.log("🎒 Database Tables initialized successfully (Users & Bookings).");
    } catch (error) {
        console.error("❌ Database initialization failed:", error.message);
    }
};

await initializeDatabase();

export default pool;