const express = require('express');
const multer = require('multer');
const router = express.Router();
const { transcribe, speak } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

// Exactly one audio file and nothing else, since the upload is held in memory.
// Groq's free tier accepts audio files up to 25 MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1, fields: 0 },
});

function uploadAudio(req, res, next) {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      err.statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      if (err.code === 'LIMIT_FILE_SIZE') err.message = 'Recording is too large (max 25 MB).';
    }
    next(err);
  });
}

router.post('/transcribe', protect, uploadAudio, transcribe);
router.post('/speak',      protect, speak);

module.exports = router;
