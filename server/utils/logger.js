const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new transports.Console(), // Logs to console
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Logs errors to file
        new transports.File({ filename: 'logs/combined.log' }), // Logs all levels to file
    ],
});

module.exports = logger;
