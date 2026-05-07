const mysql = require('mysql2/promise');

async function init() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '031544',
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS swd_a3');
    await connection.query('USE swd_a3');
    await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

    console.log('Database and users table are ready.');
    await connection.end();
}

init().catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
});
