const express = require('express');
const cors = require('cors');
require('dotenv').config();

const journalRoutes = require('./routes/journal');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/journal', journalRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('AI Journal API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
