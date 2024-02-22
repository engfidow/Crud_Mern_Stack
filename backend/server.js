const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB✅'))
  .catch(err => console.log(err));

// Define routes
app.use('/api/users', require('./routes/User'));
app.use('/uploads', express.static('uploads'));


app.listen(PORT, () => console.log(`Server running on port ${PORT}🔥`));
