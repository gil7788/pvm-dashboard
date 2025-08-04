export interface ContractMetadata {
  id: string;
  name: string;
  // Keep frontend compatible fields
  network: string; // For frontend compatibility - derived from networkInfo.name
  contractType: "solidity" | "ink" | "both";
  // Latest deployment addresses for frontend compatibility
  solidityAddress: string | null;
  inkAddress: string | null;
  solidityDeployedTime: string | null;
  inkDeployedTime: string | null;
}

export interface ContractFunction {
  name: string;
  gasUsed: string;
  runtime: string;
  lastTested: string;
}

export interface SolidityContract {
  gasConsumption: string;
  bytecode: string;
  bytecodeSize: string;
  abi: Array<{
    inputs?: Array<{ name: string; type: string }>;
    name: string;
    outputs?: Array<{ name: string; type: string }>;
    type: string;
  }>;
  functions: ContractFunction[];
}

export interface InkContract {
  gasConsumption: string;
  bytecode: string;
  bytecodeSize: string;
  abi: {
    spec: {
      constructors: any[];
      messages: Array<{
        args: Array<{ name: string; type: { displayName: string[]; type: number } }>;
        name: string;
        returnType: { displayName: string[]; type: number };
      }>;
    };
  };
  functions: ContractFunction[];
}

export interface ContractData {
  metadata: ContractMetadata;
  status: "success" | "failure";
  deployedTime: string;
  solidity?: SolidityContract;
  ink?: InkContract;
} 