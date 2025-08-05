import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import config from '../env';
import path from 'path';
import { Format } from 'logform';
import fs from 'fs';

class Logger {
    private logger: WinstonLogger;

    constructor() {
        const logFormat = format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level}]: ${message}`;
        });

        if (config.env === config.strings.DEV_ENV) {
            this.logger = this.setConsoleLogger(logFormat);
        } else {
            this.logger = this.setFileLogger(logFormat);
        }
        this.overWriteConsole();
    }

    private overWriteConsole() {
        console.log = (msg: any, ...args: any[]) => this.logger.info(String(msg), ...args);
        console.info = (msg: any, ...args: any[]) => this.logger.info(String(msg), ...args);
        console.warn = (msg: any, ...args: any[]) => this.logger.warn(String(msg), ...args);
        console.error = (msg: any, ...args: any[]) => this.logger.error(String(msg), ...args);
        console.debug = (msg: any, ...args: any[]) => this.logger.debug(String(msg), ...args);
    }

    private setConsoleLogger(logFormat: Format): WinstonLogger {
        return createLogger({
            level: 'debug',
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
            transports: [
                new transports.Console()
            ]
        });
    }

    private setFileLogger(logFormat: Format): WinstonLogger {
        this.createLogFiles();
        return createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
            transports: [
                new transports.File({ filename: path.join(config.logDirectory, 'error.log'), level: 'error' }),
                new transports.File({ filename: path.join(config.logDirectory, 'warn.log'), level: 'warn' }),
                new transports.File({ filename: path.join(config.logDirectory, 'info.log'), level: 'info' }),
                new transports.File({ filename: path.join(config.logDirectory, 'debug.log'), level: 'debug' })
            ]
        });
    }

    private createLogFiles(): void {
        this.createLogsDirectory();
        if (!fs.existsSync(path.join(config.logDirectory, 'debug.log'))) {
            fs.writeFileSync(path.join(config.logDirectory, 'debug.log'), '');
        }
        if (!fs.existsSync(path.join(config.logDirectory, 'error.log'))) {
            fs.writeFileSync(path.join(config.logDirectory, 'error.log'), '');
        }
        if (!fs.existsSync(path.join(config.logDirectory, 'info.log'))) {
            fs.writeFileSync(path.join(config.logDirectory, 'info.log'), '');
        }
        if (!fs.existsSync(path.join(config.logDirectory, 'warn.log'))) {
            fs.writeFileSync(path.join(config.logDirectory, 'warn.log'), '');
        }
    }

    private createLogsDirectory(): void {
        if (!fs.existsSync(config.logDirectory)) {
            fs.mkdirSync(config.logDirectory, { recursive: true });
        }
    }
}

const logger = new Logger();

export default logger;
