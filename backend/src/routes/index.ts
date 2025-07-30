import express from 'express';
import contractsRouter from './contracts';
import networksRouter from './networks';
import benchmarksRouter from './benchmarks';
import deploymentsRouter from './deployments';
import usersRouter from './users';

const router = express.Router();

// API health check
router.get('/', (req, res) => {
  res.json({
    message: 'PVM Dashboard API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// API status endpoint
router.get('/status', async (req: any, res) => {
  try {
    const status = await req.mongoService.healthCheck();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Service unavailable',
      checks: {
        database: false,
        collections: false
      }
    });
  }
});

// Register API routes
router.use('/contracts', contractsRouter);
router.use('/networks', networksRouter);
router.use('/benchmarks', benchmarksRouter);
router.use('/deployments', deploymentsRouter);
router.use('/users', usersRouter);

export default router;
