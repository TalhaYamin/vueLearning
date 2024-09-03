const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/buyers', buyerRoutes);

app.use(globalErrorHandler);

module.exports = app;
