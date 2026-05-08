// lib/db.js — MySQL connection pool shared across all API routes
import mysql from 'mysql2/promise';

// Create a pool so connections are reused instead of opened per request
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // queue requests when pool is full
    connectionLimit: 10,        // max simultaneous connections
    queueLimit: 0,              // 0 = unlimited queue
});

export default pool;
