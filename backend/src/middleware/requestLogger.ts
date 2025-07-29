import { Request, Response, NextFunction } from 'express';
import logger from '../utils/Logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Capturar el user agent
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log del request inicial
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    userAgent,
    ip: req.ip,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Interceptar el final de la respuesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log del response
    logger.access(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      userAgent
    );
    
    // Log adicional para errores
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    }
  });

  next();
}; 