const express = require('express');
const multer = require('multer');
const path = require('path');
const localPath = `${process.cwd()}/uploads`;
const uploadStaticPath = express.static(path.join(__dirname, '../uploads'));

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

const upload = multer({
    storage: storage,
    limits: { files: 1, fileSize: 5 * 1024 * 1024 },
    fileFilter,
}).single('image');

function fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('File extension not supported', false));
    }
    cb(null, true);
}
function uploadMiddleware(req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        next();
    });
}

module.exports = { upload, uploadStaticPath, uploadMiddleware };
