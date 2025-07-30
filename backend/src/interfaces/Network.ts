export interface Network {
  id: string;
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  status: "active" | "inactive" | "maintenance";
  features: {
    supportsSolidity: boolean;
    supportsInk: boolean;
    supportsEVM: boolean;
    supportsWASM: boolean;
  };
  metadata: {
    description?: string;
    website?: string;
    documentation?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateNetworkRequest {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    symbol: string;
    name: string;
    decimals: number;
  };
  status?: "active" | "inactive" | "maintenance";
  features: {
    supportsSolidity: boolean;
    supportsInk: boolean;
    supportsEVM: boolean;
    supportsWASM: boolean;
  };
  metadata?: {
    description?: string;
    website?: string;
    documentation?: string;
    github?: string;
  };
}

export interface UpdateNetworkRequest {
  name?: string;
  chainId?: string;
  rpcUrl?: string;
  explorerUrl?: string;
  currency?: {
    symbol: string;
    name: string;
    decimals: number;
  };
  status?: "active" | "inactive" | "maintenance";
  features?: {
    supportsSolidity: boolean;
    supportsInk: boolean;
    supportsEVM: boolean;
    supportsWASM: boolean;
  };
  metadata?: {
    description?: string;
    website?: string;
    documentation?: string;
    github?: string;
  };
} 