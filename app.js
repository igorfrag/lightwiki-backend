const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'http://localhost:4173',
            'http://localhost:8080',
        ] /* Dev + Preview + Docker Origins*/,
        credentials: true,
    })
);
app.use(cookieParser());
const { loginRoute, authenticateToken } = require('./routes/login.js');
const registerRoute = require('./routes/register.js');

const localPath = `${process.cwd()}/uploads`;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, localPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueFilename =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueFilename + ext);
    },
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3000;

const db = require('./src/config/db.js');

app.get('/api/posts/:page', async (req, res) => {
    const POSTS_PER_PAGE = 5;
    const { page } = req.params;

    try {
        const totalPosts = await db.query('SELECT COUNT(*) FROM posts');
        const maxPages = totalPosts.rows[0].count / POSTS_PER_PAGE;
        const result = await db.query(
            'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET ($2 - 1) * $1',
            [POSTS_PER_PAGE, page]
        );
        if (result.rows.length === 0) {
            return res.json(result.rows);
        }
        const content = result.rows;
        res.json({ content, maxPages });
    } catch (err) {
        console.error('Erro ao buscar posts');
        res.status(500).send('Erro interno');
    }
});

app.get('/api/post/:id', async (req, res) => {
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

app.post('/api/new', upload.single('image'), async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');

    try {
        const { title, body } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        if (!title || !body) {
            return res.status(400).json('Title and body required');
        }
        const result = await db.query(
            'INSERT INTO posts (title, body, created_at, image_path) VALUES ($1, $2, NOW(), $3) RETURNING *',
            [title, body, imagePath]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao postar', err);
        res.status(500).send('Erro interno');
    }
});

app.delete('/api/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM posts WHERE id = $1', [
            id,
        ]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const imagePath = result.rows[0].image_path;
        if (imagePath !== 'null') {
            const filePath = process.cwd();
            console.log(filePath + imagePath);
            fs.unlink(filePath + imagePath, (err) => {
                if (err) {
                    console.error('Erro ao deletar imagem', err.message);
                }
            });
        }

        const deleteResult = await db.query(
            'DELETE FROM posts WHERE id = $1 RETURNING *',
            [id]
        );

        res.json(deleteResult.rows[0]);
    } catch (err) {
        console.error('Erro ao deletar post', err);
        res.status(500).send('Erro interno');
    }
});

app.use(loginRoute);
app.use(registerRoute);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
});
