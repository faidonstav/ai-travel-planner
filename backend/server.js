require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/tripRoutes');
const app = express();

app.use(express.json());

app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travel planner backend is running' });
});

app.use('/api/trips', tripRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});