# 🎬 Book My Ticket - Seat Booking System

A full-stack seat booking application built with **Node.js, Express, PostgreSQL, and JWT Authentication**.  
Users can register, login, and book cinema seats in real-time with secure authentication and database transactions.

## 🚀 Live Demo
👉 Backend URL:  
 https://render.com/docs/web-services#port-binding

## ✨ Features

- 🔐 User Registration & Login (JWT Auth)
- 💺 Real-time Seat Booking System
- 🧾 PostgreSQL Database Integration
- ⚡ Transaction-safe seat booking (BEGIN / COMMIT / ROLLBACK)
- 🛡️ Protected routes using middleware
- 🎯 Prevents double booking using row locking (`FOR UPDATE`)
- 🌐 CORS enabled API
- 🎨 Simple frontend UI (HTML + Tailwind)

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- HTML + Tailwind CSS

## 📂 Project Structure

src
/auth
register.mjs
login.mjs
/middleware
auth.mjs
/config
db.mjs
index.mjs
index.html
package.json

## 🔐 Authentication Flow

- Register user
- Login user → JWT token generated
- Store token in frontend
- Send token in Authorization header
- Access protected booking route
  
## 💺 Seat Booking Logic

- Uses PostgreSQL row locking (FOR UPDATE)
- Prevents multiple users booking same seat
- Transaction safety ensured using:
- BEGIN
- COMMIT
- ROLLBACK

## Author
Sarika Malhotra

Gr
---
