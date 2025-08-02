import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import indexRouter from './routes/index';
import postsRouter from './routes/posts';
import contractsRouter from './routes/contracts';
import MongoManager from './MongoManager';
import { MongoService } from './services/MongoService';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/Logger';
import config from './env';
import { swaggerUi, swaggerSpec } from './config/swagger';

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize MongoDB connection
const mongoManager = MongoManager.getInstance(config.connectionString, config.dbName);
const mongoService = MongoService.getInstance(mongoManager);

// Connect to MongoDB
mongoManager.connect().then(() => {
  logger.info('MongoDB connection established');
}).catch((error) => {
  logger.error('Failed to connect to MongoDB:', error);
});

app.use(async (req: Request & { mongoService?: any }, res: Response, next: NextFunction) => {
  try {
    req.mongoService = mongoService;
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/api', indexRouter);  // API base routes
app.use('/api/contracts', contractsRouter);

// Catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// Error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
