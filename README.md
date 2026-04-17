# Book My Ticket

A backend-driven movie seat booking system built by extending an existing codebase. The focus of this project is to implement authentication and a protected booking flow while preserving the existing functionality.

---

## Features

### Authentication

* User registration with password hashing using bcrypt
* User login with JWT token generation
* Protected routes using authentication middleware

### Booking System

* Seat booking using PostgreSQL transactions
* Row-level locking using `SELECT ... FOR UPDATE`
* Prevention of duplicate seat bookings
* Bookings associated with authenticated users

---

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* bcrypt
* JSON Web Token (JWT)

---

## API Endpoints

### Register

POST /register
Body:
{
"email": "[user@example.com](mailto:user@example.com)",
"password": "password123"
}

---

### Login

POST /login
Returns:
{
"token": "JWT_TOKEN"
}

---

### Get All Seats

GET /seats

---

### Book Seat (Protected)

PUT /:id/:name

Headers:
Authorization: Bearer <token>

---

## Database Setup (Required for Running Locally)

Create the following tables in PostgreSQL:

### 1. Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

### 2. Seats Table

```sql
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  is_booked INT DEFAULT 0
);
```

Insert sample seats:

```sql
INSERT INTO seats (is_booked)
SELECT 0 FROM generate_series(1, 20);
```

### 3. Bookings Table

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT,
  seat_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## How to Run Locally

1. Clone the repository
   git clone <your-repo-url>

2. Install dependencies
   npm install

3. Configure database connection
   Update the PostgreSQL credentials inside `index.mjs`:

* host
* user
* password
* database

4. Start the server
   node index.mjs

5. Server will run on
   http://localhost:8080

---

## Key Design Decisions

* Used database transactions to ensure data consistency
* Implemented row-level locking to prevent concurrent booking conflicts
* Used JWT for stateless authentication
* Extended existing code without breaking original endpoints

---

## Notes

* No payment integration is implemented as it is out of scope
* Movie data is mocked as per assignment instructions
* Focus is on backend logic and authentication

---

## Author

Sarika

