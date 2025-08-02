import express from 'express';
import { CreateBenchmarkRequest, UpdateBenchmarkRequest } from '../interfaces/Benchmark';
import { CreateBenchmarkRunRequest } from '../interfaces/BenchmarkRun';
import logger from '../utils/Logger';

const router = express.Router();

// GET /api/benchmarks - Get all benchmarks
router.get('/', async (req: any, res) => {
  try {
    logger.info('Fetching all benchmarks');
    const benchmarks = await req.mongoService.getBenchmarkService().getAllBenchmarks();
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks' });
  }
});

// GET /api/benchmarks/:id - Get benchmark by ID
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching benchmark with ID: ${id}`);
    
    const benchmark = await req.mongoService.getBenchmarkService().getBenchmarkById(id);
    if (!benchmark) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }
    
    res.json(benchmark);
  } catch (error) {
    logger.error('Error fetching benchmark:', error);
    res.status(500).json({ error: 'Failed to fetch benchmark' });
  }
});

// POST /api/benchmarks - Create new benchmark
router.post('/', async (req: any, res) => {
  try {
    const benchmarkData: CreateBenchmarkRequest = req.body;
    logger.info('Creating new benchmark:', benchmarkData);
    
    // Validate required fields
    if (!benchmarkData.contractId || !benchmarkData.deploymentId || !benchmarkData.requestedBy || !benchmarkData.benchmarkType) {
      return res.status(400).json({ 
        error: 'Missing required fields: contractId, deploymentId, requestedBy, benchmarkType' 
      });
    }
    
    const newBenchmark = await req.mongoService.getBenchmarkService().createBenchmark(benchmarkData);
    res.status(201).json(newBenchmark);
  } catch (error) {
    logger.error('Error creating benchmark:', error);
    res.status(500).json({ error: 'Failed to create benchmark' });
  }
});

// PUT /api/benchmarks/:id - Update benchmark
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateBenchmarkRequest = req.body;
    logger.info(`Updating benchmark with ID: ${id}`, updateData);
    
    const updatedBenchmark = await req.mongoService.getBenchmarkService().updateBenchmark(id, updateData);
    if (!updatedBenchmark) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }
    
    res.json(updatedBenchmark);
  } catch (error) {
    logger.error('Error updating benchmark:', error);
    res.status(500).json({ error: 'Failed to update benchmark' });
  }
});

// DELETE /api/benchmarks/:id - Delete benchmark
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting benchmark with ID: ${id}`);
    
    const deleted = await req.mongoService.getBenchmarkService().deleteBenchmark(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting benchmark:', error);
    res.status(500).json({ error: 'Failed to delete benchmark' });
  }
});

// GET /api/benchmarks/contract/:contractId - Get benchmarks by contract
router.get('/contract/:contractId', async (req: any, res) => {
  try {
    const { contractId } = req.params;
    logger.info(`Fetching benchmarks for contract ID: ${contractId}`);
    
    const benchmarks = await req.mongoService.getBenchmarkService().getBenchmarksByContract(contractId);
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks by contract:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks by contract' });
  }
});

// GET /api/benchmarks/deployment/:deploymentId - Get benchmarks by deployment
router.get('/deployment/:deploymentId', async (req: any, res) => {
  try {
    const { deploymentId } = req.params;
    logger.info(`Fetching benchmarks for deployment ID: ${deploymentId}`);
    
    const benchmarks = await req.mongoService.getBenchmarkService().getBenchmarksByDeployment(deploymentId);
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks by deployment:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks by deployment' });
  }
});

// GET /api/benchmarks/user/:userId - Get benchmarks by user
router.get('/user/:userId', async (req: any, res) => {
  try {
    const { userId } = req.params;
    logger.info(`Fetching benchmarks for user ID: ${userId}`);
    
    const benchmarks = await req.mongoService.getBenchmarkService().getBenchmarksByUser(userId);
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks by user:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks by user' });
  }
});

// GET /api/benchmarks/type/:type - Get benchmarks by type
router.get('/type/:type', async (req: any, res) => {
  try {
    const { type } = req.params;
    logger.info(`Fetching benchmarks of type: ${type}`);
    
    if (!['gas', 'execution_time', 'storage', 'comprehensive'].includes(type)) {
      return res.status(400).json({ error: 'Invalid benchmark type' });
    }
    
    const benchmarks = await req.mongoService.getBenchmarkService().getBenchmarksByType(type as "gas" | "execution_time" | "storage" | "comprehensive");
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks by type:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks by type' });
  }
});

// GET /api/benchmarks/status/:status - Get benchmarks by status
router.get('/status/:status', async (req: any, res) => {
  try {
    const { status } = req.params;
    logger.info(`Fetching benchmarks with status: ${status}`);
    
    if (!['pending', 'running', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid benchmark status' });
    }
    
    const benchmarks = await req.mongoService.getBenchmarkService().getBenchmarksByStatus(status as "pending" | "running" | "completed" | "failed");
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error fetching benchmarks by status:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarks by status' });
  }
});

// GET /api/benchmarks/search/:query - Search benchmarks
router.get('/search/:query', async (req: any, res) => {
  try {
    const { query } = req.params;
    logger.info(`Searching benchmarks with query: ${query}`);
    
    const benchmarks = await req.mongoService.getBenchmarkService().searchBenchmarks(query);
    res.json(benchmarks);
  } catch (error) {
    logger.error('Error searching benchmarks:', error);
    res.status(500).json({ error: 'Failed to search benchmarks' });
  }
});

// === BENCHMARK RUN ROUTES ===

// GET /api/benchmarks/:benchmarkId/runs - Get all runs for a benchmark
router.get('/:benchmarkId/runs', async (req: any, res) => {
  try {
    const { benchmarkId } = req.params;
    logger.info(`Fetching runs for benchmark ID: ${benchmarkId}`);
    
    const runs = await req.mongoService.getBenchmarkRunService().getBenchmarkRunsByBenchmark(benchmarkId);
    res.json(runs);
  } catch (error) {
    logger.error('Error fetching benchmark runs:', error);
    res.status(500).json({ error: 'Failed to fetch benchmark runs' });
  }
});

// POST /api/benchmarks/:benchmarkId/runs - Execute a new benchmark run
router.post('/:benchmarkId/runs', async (req: any, res) => {
  try {
    const { benchmarkId } = req.params;
    const runData = req.body;
    logger.info(`Executing new run for benchmark ID: ${benchmarkId}`, runData);
    
    const newRun = await req.mongoService.getBenchmarkRunService().executeBenchmarkRun(benchmarkId, runData);
    res.status(201).json(newRun);
  } catch (error) {
    logger.error('Error executing benchmark run:', error);
    res.status(500).json({ error: 'Failed to execute benchmark run' });
  }
});

// GET /api/benchmarks/:benchmarkId/stats - Get benchmark statistics
router.get('/:benchmarkId/stats', async (req: any, res) => {
  try {
    const { benchmarkId } = req.params;
    logger.info(`Fetching stats for benchmark ID: ${benchmarkId}`);
    
    const stats = await req.mongoService.getBenchmarkRunService().getBenchmarkRunStats(benchmarkId);
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching benchmark stats:', error);
    res.status(500).json({ error: 'Failed to fetch benchmark stats' });
  }
});

// GET /api/benchmarks/:benchmarkId/average - Get average results for a benchmark
router.get('/:benchmarkId/average', async (req: any, res) => {
  try {
    const { benchmarkId } = req.params;
    logger.info(`Fetching average results for benchmark ID: ${benchmarkId}`);
    
    const averageResults = await req.mongoService.getBenchmarkRunService().getAverageResults(benchmarkId);
    if (!averageResults) {
      return res.status(404).json({ error: 'No successful runs found for this benchmark' });
    }
    
    res.json(averageResults);
  } catch (error) {
    logger.error('Error fetching average results:', error);
    res.status(500).json({ error: 'Failed to fetch average results' });
  }
});

export default router;