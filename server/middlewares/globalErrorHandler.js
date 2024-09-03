const AppError = require('../utils/errorHandler');
const logger = require('../utils/logger'); // We'll set up logging next

const globalErrorHandler = (err, req, res, next) => {
    if (err.isOperational) {
        logger.error(err.message); 
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }

    logger.error('Unexpected Error: ', err);

    res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server!',
    });
};

module.exports = globalErrorHandler;
