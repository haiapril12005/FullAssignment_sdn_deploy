const path = require('path');
const fs = require('fs');
const express = require('express');
const logger = require('morgan');

const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

/* ---------- Middleware ---------- */
app.use(logger(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: only needed if the React app is hosted on another domain (e.g. Vercel).
// The token travels in the Authorization header (no cookies), so "*" is safe here.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* ---------- REST API ---------- */
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);

// Unknown /api/* route -> JSON 404
app.use('/api', (req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` }));

/* ---------- React frontend (client/dist after `npm run build`) ---------- */
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // React Router handles /login, /dashboard/quiz, /admin/... on the client side
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
} else {
  app.get('/', (req, res) =>
    res.send('SimpleQuiz API is running. Build the React app with "npm run build" to serve the frontend here.')
  );
}

/* ---------- Error handling (validation + HTTP errors) ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 400;
    message = 'Duplicate value: ' + Object.keys(err.keyValue || {}).join(', ');
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }
  if (status >= 500) console.error(err);
  res.status(status).json({ message });
});

module.exports = app;
