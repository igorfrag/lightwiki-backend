const express = require('express');
const loginRoute = express.Router();
const db = require('../src/config/db.js');
const bcrypt = require('bcryptjs');

loginRoute.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: 'Username and password required' });
        }
        const getHashedPassword = await db.query(
            'SELECT password FROM users WHERE username = $1',
            [username]
        );
        const hashedPassword = getHashedPassword.rows[0].password;
        if (bcrypt.compareSync(password, hashedPassword)) {
            if (hashedPassword === 0) {
                return res.status(404).json({ error: 'User Not Found' });
            }
            const result = await db.query(
                'SELECT * FROM users WHERE username = $1 AND password = $2',
                [username, hashedPassword]
            );
            res.send(result.rows[0]);
        } else {
            res.status(200).send('Wrong password');
        }
    } catch (err) {
        console.error('Erro ao buscar usuario', err);
        res.status(500).send('Erro interno');
    }
});

module.exports = loginRoute;
