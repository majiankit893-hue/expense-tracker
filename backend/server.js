const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configurable CORS for Production
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocks access from origin: ${origin}`));
      }
    },
    credentials: true
  }));
} else {
  // Development default
  app.use(cors());
}

app.use(express.json());

// Mount API routes
app.use('/api', expenseRoutes);

// In Production: Serve frontend static build files if hosted together
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get(/^.*$/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Production-Safe Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  // Hide internal implementation stack traces in production
  const responsePayload = {
    error: 'Internal server error.'
  };

  if (NODE_ENV !== 'production') {
    responsePayload.details = err.message || err.toString();
  }

  res.status(500).json(responsePayload);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running in [${NODE_ENV}] mode on port ${PORT}`);
});
