const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/buyers', buyerRoutes);

app.use(globalErrorHandler);
app.use(compression()); 
app.use(helmet());

module.exports = app;
