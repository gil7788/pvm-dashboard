// import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
// import config from '../env';
// import path from 'path';
// import { Format } from 'logform';
// import fs from 'fs';

// class Logger {
//     private logger: WinstonLogger;

//     constructor() {
//         const logFormat = format.printf(({ level, message, timestamp }) => {
//             return `${timestamp} [${level}]: ${message}`;
//         });

//         if (config.env === 'dev') {
//             this.logger = this.setConsoleLogger(logFormat);
//         } else {
//             this.logger = this.setFileLogger(logFormat);
//         }
//     }

//     private setConsoleLogger(logFormat: Format): WinstonLogger {
//         return createLogger({
//             level: 'debug',
//             format: format.combine(
//                 format.colorize(),
//                 format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                 logFormat
//             ),
//             transports: [
//                 new transports.Console()
//             ]
//         });
//     }

//     private setFileLogger(logFormat: Format): WinstonLogger {
//         this.createLogFiles();
//         return createLogger({
//             level: 'info',
//             format: format.combine(
//                 format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//                 logFormat
//             ),
//             transports: [
//                 new transports.File({ filename: path.join(config.logDirectory, 'error.log'), level: 'error' }),
//                 new transports.File({ filename: path.join(config.logDirectory, 'warn.log'), level: 'warn' }),
//                 new transports.File({ filename: path.join(config.logDirectory, 'info.log'), level: 'info' }),
//                 new transports.File({ filename: path.join(config.logDirectory, 'debug.log'), level: 'debug' })
//             ]
//         });
//     }

//     private createLogFiles(): void {
//         this.createLogsDirectory();
//         if (!fs.existsSync(path.join(config.logDirectory, 'debug.log'))) {
//             fs.writeFileSync(path.join(config.logDirectory, 'debug.log'), '');
//         }
//         if (!fs.existsSync(path.join(config.logDirectory, 'error.log'))) {
//             fs.writeFileSync(path.join(config.logDirectory, 'error.log'), '');
//         }
//         if (!fs.existsSync(path.join(config.logDirectory, 'info.log'))) {
//             fs.writeFileSync(path.join(config.logDirectory, 'info.log'), '');
//         }
//         if (!fs.existsSync(path.join(config.logDirectory, 'warn.log'))) {
//             fs.writeFileSync(path.join(config.logDirectory, 'warn.log'), '');
//         }
//     }

//     private createLogsDirectory(): void {
//         if (!fs.existsSync(config.logDirectory)) {
//             fs.mkdirSync(config.logDirectory, { recursive: true });
//         }
//     }

//     public async debug(message: string) {
//         this.logger.debug(message);
//         const log: LogEntry = { message, level: 'debug', timestamp: new Date().toString() };
//     }

//     public async info(message: string) {
//         this.logger.info(message);
//         const log: LogEntry = { message, level: 'telegram', timestamp: new Date().toString() };
//     }

//     public async warn(message: string) {
//         this.logger.warn(message);
//         const log: LogEntry = { message, level: 'warn', timestamp: new Date().toString() };
//     }

//     public async error(message: string) {
//         this.logger.error(message);
//         const log: LogEntry = { message, level: 'error', timestamp: new Date().toString() };
//     }
// }

// const logger = new Logger();

// export default logger;
