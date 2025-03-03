import winston from 'winston';

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json()
);

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: logFormat,
	defaultMeta: { service: 'job-scraper-api' },
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
			),
		}),
		new winston.transports.File({
			filename: 'logs/error.log',
			level: 'error',
			maxsize: 5242880,
			maxFiles: 5,
		}),
	],
});

export default logger;
