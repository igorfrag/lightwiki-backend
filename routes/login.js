const express = require('express');
const loginRoute = express.Router();
const db = require('../src/config/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

loginRoute.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
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
            if (!hashedPassword) {
                return res.status(404).json({ error: 'User Not Found' });
            }
            const result = await db.query(
                'SELECT id, username FROM users WHERE username = $1 AND password = $2',
                [username, hashedPassword]
            );
            const user = result.rows[0];
            const accessToken = jwt.sign(
                { id: user.id, username: user.username },
                process.env.ACCESS_TOKEN_SECRET
            );
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
            });
            res.status(200).json({ msg: 'Login successful' });
        } else {
            res.status(200).json({ error: 'Wrong Password' });
        }
    } catch (err) {
        console.error('Erro ao buscar usuario', err);
        res.status(500).send('Erro interno');
    }
});

loginRoute.post('/api/logout', authenticateToken, (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).json({ msg: 'Logged out' });
});

loginRoute.get('/api/me', authenticateToken, (req, res) => {
    res.json({ user: req.username, id: req.id });
});

function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.username = user.username;
        req.id = user.id;
        next();
    });
}

module.exports = { loginRoute, authenticateToken };
