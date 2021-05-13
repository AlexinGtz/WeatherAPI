const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

//Create a format for the logger
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

//create a new logger, with a defined format and transport
const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
      ),
    transports: [
        new transports.File({ filename: 'execution.log' })
    ]
})

//Export Logger
module.exports = logger;