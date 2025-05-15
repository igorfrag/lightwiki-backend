const { Pool, Client } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
});

const firstPost = {
    title: 'Hello World!',
    body: 'Welcome to my simple note-taking app :)',
    imagePath: '/uploads/morning-12345.jpg',
};
setupDB();

async function setupDB() {
    const client = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: 'postgres',
        port: process.env.PGPORT,
    });
    const database = process.env.PGDATABASE;
    await client.connect();
    const res = await client.query(
        `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${database}'`
    );
    if (!res.rows[0]) {
        console.log(`${database} not found, setting it up.`);
        await client.query(`CREATE DATABASE ${database}`);
        console.log('Database created');
        await client.end();
        await pool.connect();
        await pool.query(`CREATE TABLE users (
                        id uuid PRIMARY KEY,
                        username VARCHAR(12) NOT NULL,
                        password VARCHAR NOT NULL,
                        name VARCHAR NOT NULL
)`);
        console.log('users Table created');
        await pool.query(`CREATE TABLE posts (
                        id serial PRIMARY KEY,
                        title VARCHAR(50) NOT NULL,
                        body VARCHAR NOT NULL,
                        created_at  timestamp with time zone,
                        image_path VARCHAR,
                        user_id uuid
)`);
        console.log('posts Table created');
        await pool.query(
            'INSERT INTO posts (title, body, created_at, image_path) VALUES ($1, $2, NOW(), $3) RETURNING *',
            [firstPost.title, firstPost.body, firstPost.imagePath]
        );
        console.log('DB Setup finished');
    } else {
        console.log(`${database} is already setup`);
        await client.end();
    }
}

module.exports = pool;
