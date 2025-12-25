import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Crear directorio de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;
  
  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'pvm-dashboard-backend' },
      transports: [
        // Archivo para todos los logs
        new winston.transports.File({ 
          filename: path.join(logsDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Archivo solo para errores
        new winston.transports.File({ 
          filename: path.join(logsDir, 'error.log'), 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Archivo para logs de acceso (requests)
        new winston.transports.File({ 
          filename: path.join(logsDir, 'access.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      ],
    });

    // En desarrollo, también mostrar en consola
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  info(message: string, data?: any): void {
    this.logger.info(message, { data });
  }
  
  error(message: string, error?: any): void {
    this.logger.error(message, { error: error?.message || error, stack: error?.stack });
  }
  
  warn(message: string, data?: any): void {
    this.logger.warn(message, { data });
  }
  
  debug(message: string, data?: any): void {
    this.logger.debug(message, { data });
  }

  // Método específico para logs de acceso (requests)
  access(method: string, url: string, statusCode: number, responseTime: number, userAgent?: string): void {
    this.logger.info('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userAgent
    });
  }
}

export default Logger.getInstance(); 