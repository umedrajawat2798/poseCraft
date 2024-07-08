const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const imageRoutes = require('./routes/imageRoutes.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

const mongo = process.env.DATABASE_URL

mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })

const corsOptions = {
  origin: '*', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb' }));
app.use('/images', express.static('public/images'));
app.use('/api', imageRoutes);



const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

