require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware: lets Express read JSON bodies from POST requests
app.use(express.json());

// Middleware: allows your React frontend (different port) to call this API
app.use(cors());

// A simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travel planner backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});