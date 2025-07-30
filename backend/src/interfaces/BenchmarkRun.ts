export interface BenchmarkRun {
  id: string;
  benchmarkId: string;
  runNumber: number;
  results: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
    memoryUsage?: number;
  };
  executedAt: string;
  duration: number;
  environment: {
    nodeVersion?: string;
    memoryLimit?: number;
    cpuCores?: number;
    platform?: string;
  };
  status: "success" | "failed" | "timeout";
  errorDetails?: string;
  createdAt: string;
}

export interface CreateBenchmarkRunRequest {
  benchmarkId: string;
  runNumber: number;
  results: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
    memoryUsage?: number;
  };
  executedAt?: string;
  duration: number;
  environment?: {
    nodeVersion?: string;
    memoryLimit?: number;
    cpuCores?: number;
    platform?: string;
  };
  status: "success" | "failed" | "timeout";
  errorDetails?: string;
}

export interface UpdateBenchmarkRunRequest {
  results?: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
    memoryUsage?: number;
  };
  duration?: number;
  environment?: {
    nodeVersion?: string;
    memoryLimit?: number;
    cpuCores?: number;
    platform?: string;
  };
  status?: "success" | "failed" | "timeout";
  errorDetails?: string;
}

export interface BenchmarkRunAggregatedResults {
  benchmarkId: string;
  avgGasUsed?: number;
  avgExecutionTime?: number;
  avgStorageSize?: number;
  avgCost?: number;
  avgEfficiency?: number;
  avgMemoryUsage?: number;
  runCount: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
}