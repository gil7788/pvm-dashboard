export interface Benchmark {
  id: string;
  contractId: string;
  deploymentId: string;
  requestedBy: string;
  benchmarkType: "gas" | "execution_time" | "storage" | "comprehensive";
  results: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
  };
  parameters: {
    inputSize?: number;
    complexity?: string;
    iterations?: number;
  };
  status: "pending" | "running" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  metadata?: {
    compiler?: string;
    optimization?: boolean;
    environment?: string;
    runCount?: number;
  };
}

export interface CreateBenchmarkRequest {
  contractId: string;
  deploymentId: string;
  requestedBy: string;
  benchmarkType: "gas" | "execution_time" | "storage" | "comprehensive";
  parameters?: {
    inputSize?: number;
    complexity?: string;
    iterations?: number;
  };
  metadata?: {
    compiler?: string;
    optimization?: boolean;
    environment?: string;
    runCount?: number;
  };
}

export interface UpdateBenchmarkRequest {
  status?: "pending" | "running" | "completed" | "failed";
  results?: {
    gasUsed?: number;
    executionTime?: number;
    storageSize?: number;
    cost?: number;
    efficiency?: number;
  };
  completedAt?: string;
  errorMessage?: string;
} 