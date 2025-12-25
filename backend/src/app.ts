import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import contractsRouter from './routes/contracts';
import MongoManager from './MongoManager';
import { MongoService } from './services/MongoService';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/Logger';
import config from './env';
import { swaggerUi, swaggerSpec } from './config/swagger';

const app = express();

app.use(morgan('dev'));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize MongoDB connection
const mongoManager = MongoManager.getInstance(config.connectionString, config.dbName);
const mongoService = MongoService.of(mongoManager); // ← updated here

// Connect to MongoDB
mongoManager.connect()
  .then(() => {
    logger.info('MongoDB connection established');
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
  });


// Attach the mongoService to each request
app.use((req: Request, res: Response, next: NextFunction) => {
  req.mongoService = mongoService;
  next();
});

app.use('/api/contracts', contractsRouter);

// Catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;
