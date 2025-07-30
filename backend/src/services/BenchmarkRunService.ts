import { BenchmarkRun as BenchmarkRunModel, IBenchmarkRun } from '../models/BenchmarkRun';
import { 
  BenchmarkRun, 
  CreateBenchmarkRunRequest, 
  UpdateBenchmarkRunRequest,
  BenchmarkRunAggregatedResults 
} from '../interfaces/BenchmarkRun';
import logger from '../utils/Logger';

export class BenchmarkRunService {
  private mapBenchmarkRunToInterface(benchmarkRun: IBenchmarkRun): BenchmarkRun {
    return {
      id: (benchmarkRun._id as any).toString(),
      benchmarkId: (benchmarkRun.benchmarkId as any).toString(),
      runNumber: benchmarkRun.runNumber,
      results: benchmarkRun.results || {},
      executedAt: benchmarkRun.executedAt.toISOString(),
      duration: benchmarkRun.duration,
      environment: benchmarkRun.environment || {},
      status: benchmarkRun.status,
      errorDetails: benchmarkRun.errorDetails,
      createdAt: benchmarkRun.createdAt.toISOString()
    };
  }

  async getAllBenchmarkRuns(): Promise<BenchmarkRun[]> {
    try {
      logger.info('Fetching all benchmark runs from database');
      const benchmarkRuns = await BenchmarkRunModel.find()
        .populate('benchmarkId', 'benchmarkType status')
        .sort({ createdAt: -1 });
      
      return benchmarkRuns.map(run => this.mapBenchmarkRunToInterface(run));
    } catch (error) {
      logger.error('Error fetching all benchmark runs:', error);
      throw error;
    }
  }

  async getBenchmarkRunById(id: string): Promise<BenchmarkRun | null> {
    try {
      logger.info(`Fetching benchmark run with ID: ${id}`);
      const benchmarkRun = await BenchmarkRunModel.findById(id)
        .populate('benchmarkId', 'benchmarkType status');
      
      if (!benchmarkRun) {
        logger.warn(`Benchmark run with ID ${id} not found`);
        return null;
      }

      return this.mapBenchmarkRunToInterface(benchmarkRun);
    } catch (error) {
      logger.error(`Error fetching benchmark run with ID ${id}:`, error);
      throw error;
    }
  }

  async createBenchmarkRun(runData: CreateBenchmarkRunRequest): Promise<BenchmarkRun> {
    try {
      logger.info('Creating new benchmark run:', { data: runData });
      
      const benchmarkRun = new BenchmarkRunModel({
        benchmarkId: runData.benchmarkId,
        runNumber: runData.runNumber,
        results: runData.results || {},
        executedAt: runData.executedAt ? new Date(runData.executedAt) : new Date(),
        duration: runData.duration,
        environment: runData.environment || {},
        status: runData.status,
        errorDetails: runData.errorDetails
      });

      const savedBenchmarkRun = await benchmarkRun.save();
      
      // Populate the relationships before returning
      await savedBenchmarkRun.populate('benchmarkId', 'benchmarkType status');
      
      logger.info(`Benchmark run created successfully with ID: ${savedBenchmarkRun._id}`);

      return this.mapBenchmarkRunToInterface(savedBenchmarkRun);
    } catch (error) {
      logger.error('Error creating benchmark run:', error);
      throw error;
    }
  }

  async updateBenchmarkRun(id: string, updateData: UpdateBenchmarkRunRequest): Promise<BenchmarkRun | null> {
    try {
      logger.info(`Updating benchmark run with ID: ${id}`, { data: updateData });
      
      const benchmarkRun = await BenchmarkRunModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('benchmarkId', 'benchmarkType status');

      if (!benchmarkRun) {
        logger.warn(`Benchmark run with ID ${id} not found for update`);
        return null;
      }

      logger.info(`Benchmark run updated successfully: ${id}`);

      return this.mapBenchmarkRunToInterface(benchmarkRun);
    } catch (error) {
      logger.error(`Error updating benchmark run with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteBenchmarkRun(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting benchmark run with ID: ${id}`);
      
      const result = await BenchmarkRunModel.findByIdAndDelete(id);
      
      if (!result) {
        logger.warn(`Benchmark run with ID ${id} not found for deletion`);
        return false;
      }

      logger.info(`Benchmark run deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting benchmark run with ID ${id}:`, error);
      throw error;
    }
  }

  async getBenchmarkRunsByBenchmark(benchmarkId: string): Promise<BenchmarkRun[]> {
    try {
      logger.info(`Fetching benchmark runs for benchmark ID: ${benchmarkId}`);
      
      const benchmarkRuns = await BenchmarkRunModel.find({ benchmarkId })
        .populate('benchmarkId', 'benchmarkType status')
        .sort({ runNumber: 1 }); // Sort by run number ascending
      
      return benchmarkRuns.map(run => this.mapBenchmarkRunToInterface(run));
    } catch (error) {
      logger.error(`Error fetching benchmark runs for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }

  async getBenchmarkRunsByStatus(status: 'success' | 'failed' | 'timeout'): Promise<BenchmarkRun[]> {
    try {
      logger.info(`Fetching benchmark runs with status: ${status}`);
      
      const benchmarkRuns = await BenchmarkRunModel.find({ status })
        .populate('benchmarkId', 'benchmarkType status')
        .sort({ createdAt: -1 });
      
      return benchmarkRuns.map(run => this.mapBenchmarkRunToInterface(run));
    } catch (error) {
      logger.error(`Error fetching benchmark runs with status ${status}:`, error);
      throw error;
    }
  }

  async getSuccessfulRunsByBenchmark(benchmarkId: string): Promise<BenchmarkRun[]> {
    try {
      logger.info(`Fetching successful benchmark runs for benchmark ID: ${benchmarkId}`);
      
      const benchmarkRuns = await BenchmarkRunModel.find({ 
        benchmarkId, 
        status: 'success' 
      }).populate('benchmarkId', 'benchmarkType status')
       .sort({ runNumber: 1 });
      
      return benchmarkRuns.map(run => this.mapBenchmarkRunToInterface(run));
    } catch (error) {
      logger.error(`Error fetching successful benchmark runs for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }

  async getAverageResults(benchmarkId: string): Promise<BenchmarkRunAggregatedResults | null> {
    try {
      logger.info(`Calculating average results for benchmark ID: ${benchmarkId}`);
      
      const aggregationResult = await BenchmarkRunModel.aggregate([
        { $match: { benchmarkId: benchmarkId, status: 'success' } },
        {
          $group: {
            _id: '$benchmarkId',
            avgGasUsed: { $avg: '$results.gasUsed' },
            avgExecutionTime: { $avg: '$results.executionTime' },
            avgStorageSize: { $avg: '$results.storageSize' },
            avgCost: { $avg: '$results.cost' },
            avgEfficiency: { $avg: '$results.efficiency' },
            avgMemoryUsage: { $avg: '$results.memoryUsage' },
            runCount: { $sum: 1 },
            minDuration: { $min: '$duration' },
            maxDuration: { $max: '$duration' },
            avgDuration: { $avg: '$duration' }
          }
        }
      ]);

      if (aggregationResult.length === 0) {
        logger.warn(`No successful runs found for benchmark ${benchmarkId}`);
        return null;
      }

      const result = aggregationResult[0];
      return {
        benchmarkId: benchmarkId,
        avgGasUsed: result.avgGasUsed || undefined,
        avgExecutionTime: result.avgExecutionTime || undefined,
        avgStorageSize: result.avgStorageSize || undefined,
        avgCost: result.avgCost || undefined,
        avgEfficiency: result.avgEfficiency || undefined,
        avgMemoryUsage: result.avgMemoryUsage || undefined,
        runCount: result.runCount,
        minDuration: result.minDuration,
        maxDuration: result.maxDuration,
        avgDuration: result.avgDuration
      };
    } catch (error) {
      logger.error(`Error calculating average results for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }

  async getNextRunNumber(benchmarkId: string): Promise<number> {
    try {
      logger.info(`Getting next run number for benchmark ID: ${benchmarkId}`);
      
      const lastRun = await BenchmarkRunModel.findOne({ benchmarkId })
        .sort({ runNumber: -1 })
        .select('runNumber');
      
      return lastRun ? lastRun.runNumber + 1 : 1;
    } catch (error) {
      logger.error(`Error getting next run number for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }

  async executeBenchmarkRun(benchmarkId: string, runData: Omit<CreateBenchmarkRunRequest, 'benchmarkId' | 'runNumber'>): Promise<BenchmarkRun> {
    try {
      logger.info(`Executing new benchmark run for benchmark ID: ${benchmarkId}`);
      
      // Get the next run number
      const runNumber = await this.getNextRunNumber(benchmarkId);
      
      // Create the run with the calculated run number
      const benchmarkRunData: CreateBenchmarkRunRequest = {
        benchmarkId,
        runNumber,
        ...runData
      };
      
      return await this.createBenchmarkRun(benchmarkRunData);
    } catch (error) {
      logger.error(`Error executing benchmark run for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }

  async getBenchmarkRunStats(benchmarkId: string): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    timeoutRuns: number;
    averageResults: BenchmarkRunAggregatedResults | null;
  }> {
    try {
      logger.info(`Getting benchmark run stats for benchmark ID: ${benchmarkId}`);
      
      const [totalRuns, successfulRuns, failedRuns, timeoutRuns, averageResults] = await Promise.all([
        BenchmarkRunModel.countDocuments({ benchmarkId }),
        BenchmarkRunModel.countDocuments({ benchmarkId, status: 'success' }),
        BenchmarkRunModel.countDocuments({ benchmarkId, status: 'failed' }),
        BenchmarkRunModel.countDocuments({ benchmarkId, status: 'timeout' }),
        this.getAverageResults(benchmarkId)
      ]);

      return {
        totalRuns,
        successfulRuns,
        failedRuns,
        timeoutRuns,
        averageResults
      };
    } catch (error) {
      logger.error(`Error getting benchmark run stats for benchmark ${benchmarkId}:`, error);
      throw error;
    }
  }
}