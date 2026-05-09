// scripts/init-bookings.js — Create the bookings table with proper schema
// Run: node scripts/init-bookings.js
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envVars = Object.fromEntries(
    readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(l => l.trim() && !l.startsWith('#'))
        .map(l => l.split('=').map(s => s.trim()))
);

const conn = await mysql.createConnection({
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    multipleStatements: true,
});

console.log('Connected to', envVars.DB_NAME);

try {
    // Create bookings table if it doesn't exist
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            event_id INT NOT NULL,
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_event (user_id, event_id),
            KEY idx_user_id (user_id),
            KEY idx_event_id (event_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Created bookings table');

    // Add FK constraints
    try {
        await conn.execute(`
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✓ Added FK: user_id → users.id (ON DELETE CASCADE)');
    } catch (err) {
        if (err.errno === 1061 || err.errno === 1826) {
            console.log('SKIP: FK fk_bookings_user already exists');
        } else {
            throw err;
        }
    }

    try {
        await conn.execute(`
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_event
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        `);
        console.log('✓ Added FK: event_id → events.id (ON DELETE CASCADE)');
    } catch (err) {
        if (err.errno === 1061 || err.errno === 1826) {
            console.log('SKIP: FK fk_bookings_event already exists');
        } else {
            throw err;
        }
    }

    console.log('\nbookings table final structure:');
    const [rows] = await conn.execute('DESCRIBE bookings');
    console.table(rows);

    console.log('\nForeign Keys:');
    const [fks] = await conn.execute(
        'SELECT CONSTRAINT_NAME, DELETE_RULE FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ?',
        [envVars.DB_NAME, 'bookings']
    );
    console.table(fks);

    console.log('\n✅ Bookings table initialized successfully!');
} catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
} finally {
    await conn.end();
}
