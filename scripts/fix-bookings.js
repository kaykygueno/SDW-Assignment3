// scripts/fix-bookings.js — Fix bookings table schema to meet requirements
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
    multipleStatements: true,
});

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('Connected to', envVars.DB_NAME);

        console.log('\n[1] Dropping existing FK constraints...');
        try {
            await conn.execute('ALTER TABLE bookings DROP FOREIGN KEY bookings_ibfk_1');
            console.log('  ✓ Dropped bookings_ibfk_1');
        } catch (e) {
            console.log('  - bookings_ibfk_1 not found');
        }

        try {
            await conn.execute('ALTER TABLE bookings DROP FOREIGN KEY bookings_ibfk_2');
            console.log('  ✓ Dropped bookings_ibfk_2');
        } catch (e) {
            console.log('  - bookings_ibfk_2 not found');
        }

        console.log('\n[2] Renaming created_at to booking_date...');
        try {
            await conn.execute('ALTER TABLE bookings CHANGE COLUMN created_at booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            console.log('  ✓ Renamed created_at to booking_date');
        } catch (e) {
            if (e.message.includes('Unknown column')) {
                console.log('  - Column created_at not found, adding booking_date...');
                await conn.execute('ALTER TABLE bookings ADD COLUMN booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
                console.log('  ✓ Added booking_date');
            } else {
                throw e;
            }
        }

        console.log('\n[3] Adding FK constraints with ON DELETE CASCADE...');
        await conn.execute(`
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('  ✓ Added fk_bookings_user');

        await conn.execute(`
            ALTER TABLE bookings
            ADD CONSTRAINT fk_bookings_event
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        `);
        console.log('  ✓ Added fk_bookings_event');

        console.log('\n[4] Verifying final schema...');
        const [schema] = await conn.execute('DESCRIBE bookings');
        console.table(schema);

        console.log('\n[5] Verifying FK delete rules...');
        const [fkDetails] = await conn.execute(
            'SELECT CONSTRAINT_NAME, DELETE_RULE FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = ? AND TABLE_NAME = ?',
            [envVars.DB_NAME, 'bookings']
        );
        console.table(fkDetails);

        console.log('\n✅ Bookings table schema fixed successfully!\n');

        conn.release();
        await pool.end();
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
})();
