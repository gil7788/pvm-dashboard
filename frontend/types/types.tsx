export interface ContractMetadata {
  id: string
  name: string
  solidityAddress: string | null
  solidityDeployedTime: string | null
  inkAddress: string | null
  inkDeployedTime: string | null
  network: string
  contractType: "solidity" | "ink" | "both"
}

export interface ContractFunctionBasic {
  name: string
  gasUsed: string
  runtime: string
  lastTested: string
}

export interface SolidityContract {
  gasConsumption: string
  bytecode: string
  bytecodeSize: string
  abi: Array<{
    inputs?: Array<{ name: string; type: string }>
    name: string
    outputs?: Array<{ name: string; type: string }>
    type: string
  }>
  functions: ContractFunctionBasic[]
}

export interface InkContract {
  gasConsumption: string
  bytecode: string
  bytecodeSize: string
  abi: {
    spec: {
      constructors: any[]
      messages: Array<{
        args: Array<{ name: string; type: { displayName: string[]; type: number } }>
        name: string
        returnType: { displayName: string[]; type: number }
      }>
    }
  }
  functions: ContractFunctionBasic[]
}

export interface ContractData {
  metadata: ContractMetadata
  status: "success" | "failure"
  deployedTime: string
  solidity?: SolidityContract
  ink?: InkContract
}

// New interfaces for backend API responses
export interface ContractABI {
  solidity: any[] | null;
  ink: any[] | null;
}

export interface ContractBytecode {
  solidity: { bytecode: string; size: string } | null;
  ink: { bytecode: string; size: string } | null;
}

export interface ContractFunction {
  name: string;
  inputs: any[];
  outputs: any[];
  stateMutability: string;
  gasUsed: string;
  runtime: string;
  lastTested: string | null;
}

export interface ContractFunctions {
  solidity: ContractFunction[];
  ink: ContractFunction[];
}

export interface ContractAnalytics {
  gasConsumption: {
    solidity: number;
    ink: number;
  };
  bytecodeSize: {
    solidity: string;
    ink: string;
  };
  benchmarks: Array<{
    id: string;
    type: string;
    results: {
      gasUsed: number;
      executionTime: number;
      storageSize: number;
      cost: number;
      efficiency: number;
    };
    createdAt: string;
    completedAt: string;
  }>;
  summary: {
    totalBenchmarks: number;
    averageGasUsed: number;
    averageRuntime: number;
  };
}
