const { toFile } = require('groq-sdk');
const config = require('../config');
const { getGroq, toHttpError } = require('../services/groqClient');

// Orpheus accepts at most 200 characters per request; the client sends sentence chunks
const MAX_TTS_CHARS = 200;

// Whisper infers the container from the file extension
const AUDIO_EXTENSIONS = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
};

// Groq streams WAV with 0xFFFFFFFF placeholder sizes in the RIFF and data
// headers. Write the real sizes so every browser can decode and time it.
function fixWavSizes(buf) {
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return buf;
  buf.writeUInt32LE(buf.length - 8, 4);
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'data') {
      buf.writeUInt32LE(buf.length - offset - 8, offset + 4);
      break;
    }
    offset += 8 + size + (size & 1);
  }
  return buf;
}

// ── POST /api/voice/transcribe (multipart, field "audio") ─────────────────────
async function transcribe(req, res, next) {
  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ success: false, error: 'No audio was uploaded.' });
    }

    const mime = (req.file.mimetype || '').split(';')[0].trim().toLowerCase();
    const ext = AUDIO_EXTENSIONS[mime];
    if (!ext) {
      return res.status(415).json({ success: false, error: `Unsupported audio type: ${mime || 'unknown'}.` });
    }

    let result;
    try {
      result = await getGroq().audio.transcriptions.create({
        file: await toFile(req.file.buffer, `answer.${ext}`, { type: mime }),
        model: config.GROQ_STT_MODEL,
        language: 'en',
        temperature: 0,
        response_format: 'json',
      });
    } catch (err) {
      console.error('Groq STT Error:', err.status, err.message);
      throw toHttpError(err, 'Failed to transcribe audio.');
    }

    res.json({ success: true, data: { text: (result.text || '').trim() } });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/voice/speak { text } → audio/wav ────────────────────────────────
// Any non-2xx tells the client to fall back to the browser's own voice.
async function speak(req, res, next) {
  try {
    if (config.TTS_PROVIDER !== 'groq') {
      return res.status(501).json({ success: false, error: 'Server-side speech is disabled.' });
    }

    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > MAX_TTS_CHARS) {
      return res.status(400).json({ success: false, error: `"text" must be 1–${MAX_TTS_CHARS} characters.` });
    }

    let audio;
    try {
      const response = await getGroq().audio.speech.create({
        model: config.GROQ_TTS_MODEL,
        voice: config.GROQ_TTS_VOICE,
        input: text,
        response_format: 'wav',
      });
      audio = fixWavSizes(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error('Groq TTS Error:', err.status, err.message);
      throw toHttpError(err, 'Failed to synthesize speech.');
    }

    res.set('Cache-Control', 'no-store');
    res.type('audio/wav').send(audio);
  } catch (err) {
    next(err);
  }
}

module.exports = { transcribe, speak, MAX_TTS_CHARS };
