import express from 'express';
import contractsRouter from './contracts';

const router = express.Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API health check
 *     description: Returns basic API information and health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PVM Dashboard API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 status:
 *                   type: string
 *                   example: "healthy"
 */
router.get('/', (req, res) => {
  res.json({
    message: 'PVM Dashboard API',
    version: '1.0.0',
    status: 'healthy'
  });
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Detailed API status
 *     description: Returns detailed health status including database connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 message:
 *                   type: string
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                     collections:
 *                       type: boolean
 *       500:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

export default router;
