import { Benchmark as BenchmarkModel, IBenchmark } from '../models/Benchmark';
import { Benchmark, CreateBenchmarkRequest, UpdateBenchmarkRequest } from '../interfaces/Benchmark';
import logger from '../utils/Logger';

export class BenchmarkService {
  private mapBenchmarkToInterface(benchmark: IBenchmark): Benchmark {
    return {
      id: (benchmark._id as any).toString(),
      contractId: (benchmark.contractId as any).toString(),
      deploymentId: (benchmark.deploymentId as any).toString(),
      requestedBy: (benchmark.requestedBy as any).toString(),
      benchmarkType: benchmark.benchmarkType,
      results: benchmark.results || {},
      parameters: benchmark.parameters || {},
      status: benchmark.status,
      createdAt: benchmark.createdAt.toISOString(),
      completedAt: benchmark.completedAt?.toISOString(),
      errorMessage: benchmark.errorMessage,
      metadata: benchmark.metadata
    };
  }

  async getAllBenchmarks(): Promise<Benchmark[]> {
    try {
      logger.info('Fetching all benchmarks from database');
      const benchmarks = await BenchmarkModel.find()
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error('Error fetching all benchmarks:', error);
      throw error;
    }
  }

  async getBenchmarkById(id: string): Promise<Benchmark | null> {
    try {
      logger.info(`Fetching benchmark with ID: ${id}`);
      const benchmark = await BenchmarkModel.findById(id)
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email');
      
      if (!benchmark) {
        logger.warn(`Benchmark with ID ${id} not found`);
        return null;
      }

      return this.mapBenchmarkToInterface(benchmark);
    } catch (error) {
      logger.error(`Error fetching benchmark with ID ${id}:`, error);
      throw error;
    }
  }

  async createBenchmark(benchmarkData: CreateBenchmarkRequest): Promise<Benchmark> {
    try {
      logger.info('Creating new benchmark:', { data: benchmarkData });
      
      const benchmark = new BenchmarkModel({
        contractId: benchmarkData.contractId,
        deploymentId: benchmarkData.deploymentId,
        requestedBy: benchmarkData.requestedBy,
        benchmarkType: benchmarkData.benchmarkType,
        parameters: benchmarkData.parameters || {},
        metadata: benchmarkData.metadata || {}
      });

      const savedBenchmark = await benchmark.save();
      
      // Populate the relationships before returning
      await savedBenchmark.populate('contractId', 'name contractType');
      await savedBenchmark.populate('deploymentId', 'address deploymentType');
      await savedBenchmark.populate('requestedBy', 'username email');
      
      logger.info(`Benchmark created successfully with ID: ${savedBenchmark._id}`);

      return this.mapBenchmarkToInterface(savedBenchmark);
    } catch (error) {
      logger.error('Error creating benchmark:', error);
      throw error;
    }
  }

  async updateBenchmark(id: string, updateData: UpdateBenchmarkRequest): Promise<Benchmark | null> {
    try {
      logger.info(`Updating benchmark with ID: ${id}`, { data: updateData });
      
      const benchmark = await BenchmarkModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('contractId', 'name contractType')
       .populate('deploymentId', 'address deploymentType')
       .populate('requestedBy', 'username email');

      if (!benchmark) {
        logger.warn(`Benchmark with ID ${id} not found for update`);
        return null;
      }

      logger.info(`Benchmark updated successfully: ${id}`);

      return this.mapBenchmarkToInterface(benchmark);
    } catch (error) {
      logger.error(`Error updating benchmark with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteBenchmark(id: string): Promise<boolean> {
    try {
      logger.info(`Deleting benchmark with ID: ${id}`);
      
      const result = await BenchmarkModel.findByIdAndDelete(id);
      
      if (!result) {
        logger.warn(`Benchmark with ID ${id} not found for deletion`);
        return false;
      }

      logger.info(`Benchmark deleted successfully: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting benchmark with ID ${id}:`, error);
      throw error;
    }
  }

  async getBenchmarksByContract(contractId: string): Promise<Benchmark[]> {
    try {
      logger.info(`Fetching benchmarks for contract ID: ${contractId}`);
      
      const benchmarks = await BenchmarkModel.find({ contractId })
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error fetching benchmarks for contract ${contractId}:`, error);
      throw error;
    }
  }

  async getBenchmarksByDeployment(deploymentId: string): Promise<Benchmark[]> {
    try {
      logger.info(`Fetching benchmarks for deployment ID: ${deploymentId}`);
      
      const benchmarks = await BenchmarkModel.find({ deploymentId })
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error fetching benchmarks for deployment ${deploymentId}:`, error);
      throw error;
    }
  }

  async getBenchmarksByUser(requestedBy: string): Promise<Benchmark[]> {
    try {
      logger.info(`Fetching benchmarks for user ID: ${requestedBy}`);
      
      const benchmarks = await BenchmarkModel.find({ requestedBy })
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error fetching benchmarks for user ${requestedBy}:`, error);
      throw error;
    }
  }

  async getBenchmarksByType(benchmarkType: "gas" | "execution_time" | "storage" | "comprehensive"): Promise<Benchmark[]> {
    try {
      logger.info(`Fetching benchmarks of type: ${benchmarkType}`);
      
      const benchmarks = await BenchmarkModel.find({ benchmarkType })
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error fetching benchmarks of type ${benchmarkType}:`, error);
      throw error;
    }
  }

  async getBenchmarksByStatus(status: "pending" | "running" | "completed" | "failed"): Promise<Benchmark[]> {
    try {
      logger.info(`Fetching benchmarks with status: ${status}`);
      
      const benchmarks = await BenchmarkModel.find({ status })
        .populate('contractId', 'name contractType')
        .populate('deploymentId', 'address deploymentType')
        .populate('requestedBy', 'username email')
        .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error fetching benchmarks with status ${status}:`, error);
      throw error;
    }
  }

  async searchBenchmarks(query: string): Promise<Benchmark[]> {
    try {
      logger.info(`Searching benchmarks with query: ${query}`);
      
      const benchmarks = await BenchmarkModel.find({
        $or: [
          { benchmarkType: { $regex: query, $options: 'i' } },
          { status: { $regex: query, $options: 'i' } },
          { 'metadata.compiler': { $regex: query, $options: 'i' } },
          { 'metadata.environment': { $regex: query, $options: 'i' } }
        ]
      }).populate('contractId', 'name contractType')
       .populate('deploymentId', 'address deploymentType')
       .populate('requestedBy', 'username email')
       .sort({ createdAt: -1 });
      
      return benchmarks.map(benchmark => this.mapBenchmarkToInterface(benchmark));
    } catch (error) {
      logger.error(`Error searching benchmarks with query ${query}:`, error);
      throw error;
    }
  }
} 