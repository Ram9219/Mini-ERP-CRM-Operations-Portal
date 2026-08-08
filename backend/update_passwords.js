const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function updatePasswords() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    const users = [
        ['admin@example.com', 'Admin123!'],
        ['sales@example.com', 'Sales123!'],
        ['warehouse@example.com', 'Warehouse123!'],
        ['accounts@example.com', 'Accounts123!']
    ];

    try {
        for (const [email, password] of users) {
            const hash = await bcrypt.hash(password, 10);

            await pool.query(
                'UPDATE users SET password = $1 WHERE email = $2',
                [hash, email]
            );

            console.log(`Updated: ${email}`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

updatePasswords();