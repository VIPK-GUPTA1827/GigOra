const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const EXT_FROM_MIMETYPE = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'text/plain': '.txt'
};

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain'
];

const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.py', '.pl', 
    '.cgi', '.jar', '.vbs', '.msi', '.com', '.scr', '.ps1',
    '.html', '.htm', '.svg', '.swf'
];

const MAGIC_BYTES = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
};

const matchesSignature = (buf, sigs) =>
    sigs.some(sig => sig.every((byte, i) => buf[i] === byte));

const validateRealType = (buffer, mimetype) => {
    if (mimetype === 'text/plain') return true;
    const sigs = MAGIC_BYTES[mimetype];
    if (!sigs) return false;
    try {
        const buf = buffer.subarray(0, 12);
        if (buf.length < 4) return false;
        if (mimetype === 'image/webp') {
            return matchesSignature(buf, sigs) && buf.subarray(8, 12).toString() === 'WEBP';
        }
        return matchesSignature(buf, sigs);
    } catch {
        return false;
    }
};

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Executable or script files are strictly forbidden for security.'), false);
    }
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, PDF, and TXT files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

const handleUpload = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size exceeds maximum limit of 5MB.'
                });
            }
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

const streamUploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

router.post('/', protect, handleUpload, async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    if (!validateRealType(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ success: false, message: 'File content does not match its declared type.' });
    }

    try {
        if (isCloudinaryConfigured) {
            const result = await streamUploadToCloudinary(req.file.buffer, `gigora/${req.user._id}`);
            return res.status(200).json({
                success: true,
                message: 'File uploaded successfully.',
                file: {
                    filename: result.public_id,
                    originalName: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    url: result.secure_url
                }
            });
        }

        // Local storage fallback
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = EXT_FROM_MIMETYPE[req.file.mimetype] || path.extname(req.file.originalname) || '';
        const filename = `${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filePath, req.file.buffer);

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully.',
            file: {
                filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/${filename}`
            }
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
