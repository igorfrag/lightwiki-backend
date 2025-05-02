const { Pool, Client } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT,
});

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
id serial PRIMARY KEY,
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
image_path VARCHAR
)`);
        console.log('posts Table created');
        await pool.end();
    } else {
        console.log(`${database} is already setup`);
        await client.end();
    }
}

module.exports = pool;
