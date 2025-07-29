import { ContractMetadata, CreateContractRequest, UpdateContractRequest } from '../interfaces/Contract';

export class ContractService {
  private contracts: ContractMetadata[] = [
    {
      id: "1",
      name: "DeFi Swap Contract",
      solidityAddress: "0x1234...5678",
      solidityDeployedTime: "2024-01-15 14:30:22",
      inkAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      inkDeployedTime: "2024-01-15 14:35:18",
      network: "Passethub",
      contractType: "both",
    },
    {
      id: "2",
      name: "NFT Marketplace",
      solidityAddress: "0xabcd...efgh",
      solidityDeployedTime: "2024-01-14 09:15:45",
      inkAddress: null,
      inkDeployedTime: null,
      network: "Passethub",
      contractType: "solidity",
    },
    {
      id: "3",
      name: "Governance Token",
      solidityAddress: null,
      solidityDeployedTime: null,
      inkAddress: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
      inkDeployedTime: "2024-01-13 16:45:12",
      network: "Passethub",
      contractType: "ink",
    },
    {
      id: "4",
      name: "Staking Pool",
      solidityAddress: "0xdef0...1234",
      solidityDeployedTime: "2024-01-12 11:20:33",
      inkAddress: "5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy",
      inkDeployedTime: "2024-01-12 11:25:45",
      network: "Passethub",
      contractType: "both",
    },
  ];

  // GET all contracts
  async getAllContracts(): Promise<ContractMetadata[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.contracts;
  }

  // GET contract by ID
  async getContractById(id: string): Promise<ContractMetadata | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.contracts.find(contract => contract.id === id) || null;
  }

  // POST create new contract
  async createContract(contractData: CreateContractRequest): Promise<ContractMetadata> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const newContract: ContractMetadata = {
      id: (this.contracts.length + 1).toString(),
      name: contractData.name,
      network: contractData.network,
      contractType: contractData.contractType,
      solidityAddress: contractData.solidityAddress || null,
      solidityDeployedTime: contractData.solidityAddress ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null,
      inkAddress: contractData.inkAddress || null,
      inkDeployedTime: contractData.inkAddress ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null,
    };

    this.contracts.push(newContract);
    return newContract;
  }

  // PUT update contract
  async updateContract(id: string, updateData: UpdateContractRequest): Promise<ContractMetadata | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const contractIndex = this.contracts.findIndex(contract => contract.id === id);
    if (contractIndex === -1) {
      return null;
    }

    const updatedContract = {
      ...this.contracts[contractIndex],
      ...updateData,
      // Update deployment times if addresses are provided
      solidityDeployedTime: updateData.solidityAddress 
        ? new Date().toISOString().replace('T', ' ').substring(0, 19)
        : this.contracts[contractIndex].solidityDeployedTime,
      inkDeployedTime: updateData.inkAddress 
        ? new Date().toISOString().replace('T', ' ').substring(0, 19)
        : this.contracts[contractIndex].inkDeployedTime,
    };

    this.contracts[contractIndex] = updatedContract;
    return updatedContract;
  }

  // DELETE contract
  async deleteContract(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    const contractIndex = this.contracts.findIndex(contract => contract.id === id);
    if (contractIndex === -1) {
      return false;
    }

    this.contracts.splice(contractIndex, 1);
    return true;
  }

  // GET contracts by network
  async getContractsByNetwork(network: string): Promise<ContractMetadata[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.contracts.filter(contract => contract.network === network);
  }

  // GET contracts by type
  async getContractsByType(contractType: "solidity" | "ink" | "both"): Promise<ContractMetadata[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return this.contracts.filter(contract => contract.contractType === contractType);
  }

  // Search contracts by name
  async searchContracts(query: string): Promise<ContractMetadata[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const lowerQuery = query.toLowerCase();
    return this.contracts.filter(contract => 
      contract.name.toLowerCase().includes(lowerQuery) ||
      contract.solidityAddress?.toLowerCase().includes(lowerQuery) ||
      contract.inkAddress?.toLowerCase().includes(lowerQuery)
    );
  }
} 