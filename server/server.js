// server.js
require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { setupSockets } = require('./sockets'); // Adjust path if necessary
const app = require('./app'); // Ensure this is correct

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB success');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Set up socket connections
setupSockets(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
