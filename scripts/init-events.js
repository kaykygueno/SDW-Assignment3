// scripts/init-events.js — Create the events table with FK to users
// Run once: node scripts/init-events.js
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually (no dotenv dependency needed)
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

// Helper: only ALTER if the column doesn't already exist
async function addColumnIfMissing(conn, table, column, definition) {
    const [cols] = await conn.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (cols.length === 0) {
        await conn.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`OK : added ${column}`);
    } else {
        console.log(`SKIP: ${column} already exists`);
    }
}

await addColumnIfMissing(conn, 'events', 'capacity', 'INT UNSIGNED NOT NULL DEFAULT 0');
await addColumnIfMissing(conn, 'events', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

// Ensure the FK from organiser_id -> users.id exists
try {
    await conn.execute(`
        ALTER TABLE events
        ADD CONSTRAINT fk_events_organiser
        FOREIGN KEY (organiser_id) REFERENCES users(id) ON DELETE CASCADE
    `);
    console.log('OK : FK fk_events_organiser added');
} catch (err) {
    if (err.errno === 1061 || err.errno === 1826) {
        console.log('SKIP: FK already exists');
    } else {
        throw err;
    }
}

console.log('\nevents table final structure:');
const [rows] = await conn.execute('DESCRIBE events');
console.table(rows);

await conn.end();
