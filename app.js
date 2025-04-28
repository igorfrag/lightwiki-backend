const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

const db = require('./src/config/db.js');

app.get('/', (req, res) => {
    res.send('Welcome to the User API!');
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM posts WHERE id = $1', [
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao buscar post', err);
        res.status(500).send('Erro interno');
    }
});

app.post('/api/new', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json('Title and body required');
        }
        const result = await db.query(
            'INSERT INTO posts (title, body, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [title, body]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao postar', err);
        res.status(500).send('Erro interno');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
