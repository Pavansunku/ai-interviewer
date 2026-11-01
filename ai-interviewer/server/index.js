const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { PORT, FRONTEND_URL, TTS_PROVIDER } = require('./config');
const connectDB = require('./utils/db');
const interviewRoutes = require('./routes/interview');
const authRoutes = require('./routes/auth');
const voiceRoutes = require('./routes/voice');
const errorHandler = require('./middleware/errorHandler');
const { verifyMail } = require('./services/mailService');

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: FRONTEND_URL || '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/voice', voiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AI Interviewer API is running.' });
});

// Unknown API routes get a JSON 404 in every mode (not the SPA or Express's HTML page)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found.` });
  });
}

// Error handler must be registered last — Express identifies it by the 4-arg signature
app.use(errorHandler);

connectDB().then(() => {
  const port = PORT || 10000;
  app.listen(port, () => {
    console.log(`🚀 AI Interviewer server running on port ${port}`);
    console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'mock'}`);
    console.log(`   Speech: STT groq, TTS ${TTS_PROVIDER}`);
    console.log(`   Frontend URL: ${FRONTEND_URL}`);
    verifyMail();
  });
});
