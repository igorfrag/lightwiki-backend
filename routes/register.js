const express = require('express');
const registerRoute = express.Router();
const db = require('../src/config/db.js');
const bcrypt = require('bcryptjs');

registerRoute.post('/api/register', async (req, res) => {
    const { username, password, name } = req.body;
    try {
        if (!username || !password || !name) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const checkExisting = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ error: 'Username exists' });
        }
        const hashedPassword = await bcrypt.hashSync(password);
        const user = await db.query(
            'INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, name]
        );
        res.status(201).json(user.rows[0]);
    } catch (err) {
        console.error('Erro ao registrar usuario', err);
        res.status(500).send('Erro interno');
    }
});

module.exports = registerRoute;
