// import { Db } from 'mongodb';
import { MongoService } from '../services/MongoService';

declare global {
  namespace Express {
    interface Request {
      mongoService?: MongoService;
    }
  }
}