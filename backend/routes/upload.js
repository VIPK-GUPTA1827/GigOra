const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Safe extension map derived strictly from validated MIME types
const EXT_FROM_MIMETYPE = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'text/plain': '.txt'
};

// Storage configuration with secure random filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = EXT_FROM_MIMETYPE[file.mimetype] || '';
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// Allowed MIME types and extensions whitelist
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

// Magic bytes signatures for content validation
const MAGIC_BYTES = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF + bytes 8-11 = WEBP
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]] // %PDF
};

const matchesSignature = (buf, sigs) =>
    sigs.some(sig => sig.every((byte, i) => buf[i] === byte));

const validateRealType = (filePath, mimetype) => {
    if (mimetype === 'text/plain') return true; // plain text has no fixed magic signature
    const sigs = MAGIC_BYTES[mimetype];
    if (!sigs) return false;
    try {
        const buf = fs.readFileSync(filePath).subarray(0, 12);
        if (buf.length < 4) return false;
        if (mimetype === 'image/webp') {
            // RIFF....WEBP
            return matchesSignature(buf, sigs) && buf.subarray(8, 12).toString() === 'WEBP';
        }
        return matchesSignature(buf, sigs);
    } catch {
        return false;
    }
};

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Explicit blocklist check
    if (BLOCKED_EXTENSIONS.includes(ext)) {
        return cb(new Error('Executable or script files are strictly forbidden for security.'), false);
    }

    // Whitelist MIME check
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, PDF, and TXT files are allowed.'), false);
    }
};

// 5MB max file size limit
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

// Wrapper middleware to gracefully handle Multer errors with proper status codes
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

// @desc    Upload attachment / image / document
// @route   POST /api/upload
// @access  Private (Requires login)
router.post('/', protect, handleUpload, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    if (!validateRealType(req.file.path, req.file.mimetype)) {
        try {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path); // delete fake file
            }
        } catch (unlinkErr) {
            console.error('Failed to unlink spoofed file:', unlinkErr);
        }
        return res.status(400).json({ success: false, message: 'File content does not match its declared type.' });
    }

    res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: `/uploads/${req.file.filename}`
        }
    });
});

module.exports = router;
