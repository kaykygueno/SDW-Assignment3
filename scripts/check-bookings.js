// scripts/check-bookings.js — Verify bookings table schema
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envVars = Object.fromEntries(
    readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(l => l.trim() && !l.startsWith('#'))
        .map(l => l.split('=').map(s => s.trim()))
);

const pool = mysql.createPool({
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Connected to', envVars.DB_NAME);

        // Check if bookings table exists
        const [tables] = await conn.execute(
            'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
            [envVars.DB_NAME, 'bookings']
        );

        if (tables.length === 0) {
            console.log('\n❌ bookings table DOES NOT EXIST\n');
        } else {
            console.log('\n✅ bookings table EXISTS\n');
            const [schema] = await conn.execute('DESCRIBE bookings');
            console.log('Current schema:');
            console.table(schema);

            // Check foreign keys
            const [fks] = await conn.execute(
                'SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
                [envVars.DB_NAME, 'bookings']
            );
            console.log('Foreign Keys:');
            if (fks.length === 0) {
                console.log('No foreign keys found');
            } else {
                console.table(fks);
                
                // Check FK DELETE actions
                const [fkDetails] = await conn.execute(
                    'SELECT CONSTRAINT_NAME, DELETE_RULE FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ?',
                    [envVars.DB_NAME, 'bookings']
                );
                console.log('\nFK Delete Rules:');
                console.table(fkDetails);
            }
        }

        conn.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();
