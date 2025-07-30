export interface Deployment {
  id: string;
  contractId: string;
  networkId: string;
  deployerId: string;
  deploymentType: "solidity" | "ink";
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  deployedAt: string;
  status: "success" | "failed" | "pending";
  metadata?: {
    compilerVersion?: string;
    optimization?: boolean;
    constructorArgs?: string[];
    verificationStatus?: "verified" | "unverified" | "pending";
    contractSize?: number;
    optimizationRuns?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentRequest {
  contractId: string;
  networkId: string;
  deployerId: string;
  deploymentType: "solidity" | "ink";
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
  deployedAt?: string;
  metadata?: {
    compilerVersion?: string;
    optimization?: boolean;
    constructorArgs?: string[];
    verificationStatus?: "verified" | "unverified" | "pending";
    contractSize?: number;
    optimizationRuns?: number;
  };
}

export interface UpdateDeploymentRequest {
  status?: "success" | "failed" | "pending";
  metadata?: {
    compilerVersion?: string;
    optimization?: boolean;
    constructorArgs?: string[];
    verificationStatus?: "verified" | "unverified" | "pending";
    contractSize?: number;
    optimizationRuns?: number;
  };
}