import { ContractService } from '../../src/services/ContractService';
import { CreateContractRequest, UpdateContractRequest } from '../../src/interfaces/Contract';

describe('ContractService Tests', () => {
  let contractService: ContractService;

  beforeEach(() => {
    contractService = new ContractService();
  });

  describe('getAllContracts', () => {
    it('should return all contracts', async () => {
      const contracts = await contractService.getAllContracts();
      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBeGreaterThan(0);
    });
  });

  describe('getContractById', () => {
    it('should return contract when ID exists', async () => {
      const contract = await contractService.getContractById('1');
      expect(contract).toBeDefined();
      expect(contract?.id).toBe('1');
      expect(contract?.name).toBe('DeFi Swap Contract');
    });

    it('should return null when ID does not exist', async () => {
      const contract = await contractService.getContractById('999');
      expect(contract).toBeNull();
    });
  });

  describe('createContract', () => {
    it('should create a new contract', async () => {
      const contractData: CreateContractRequest = {
        name: 'Test Contract',
        ownerId: '507f1f77bcf86cd799439011',
        networkId: '507f1f77bcf86cd799439012',
        contractType: 'solidity'
      };

      const newContract = await contractService.createContract(contractData);
      expect(newContract).toBeDefined();
      expect(newContract.name).toBe('Test Contract');
      expect(newContract.network).toBe('Passethub');
      expect(newContract.contractType).toBe('solidity');
      expect(newContract.solidityAddress).toBe('0x1234...5678');
      expect(newContract.solidityDeployedTime).toBeDefined();
    });

    it('should create contract with ink address', async () => {
      const contractData: CreateContractRequest = {
        name: 'Ink Contract',
        ownerId: '507f1f77bcf86cd799439011',
        networkId: '507f1f77bcf86cd799439012',
        contractType: 'ink'
      };

      const newContract = await contractService.createContract(contractData);
      expect(newContract.inkAddress).toBe('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
      expect(newContract.inkDeployedTime).toBeDefined();
    });
  });

  describe('updateContract', () => {
    it('should update existing contract', async () => {
      const updateData: UpdateContractRequest = {
        name: 'Updated Contract',
        networkId: '507f1f77bcf86cd799439012',
        contractType: 'both'
      };

      const updatedContract = await contractService.updateContract('1', updateData);
      expect(updatedContract).toBeDefined();
      expect(updatedContract?.name).toBe('Updated Contract');
      expect(updatedContract?.contractType).toBe('both');
    });

    it('should return null when contract does not exist', async () => {
      const updateData: UpdateContractRequest = {
        name: 'Updated Contract'
      };

      const updatedContract = await contractService.updateContract('999', updateData);
      expect(updatedContract).toBeNull();
    });
  });

  describe('deleteContract', () => {
    it('should delete existing contract', async () => {
      const result = await contractService.deleteContract('2');
      expect(result).toBe(true);
    });

    it('should return false when contract does not exist', async () => {
      const result = await contractService.deleteContract('999');
      expect(result).toBe(false);
    });
  });

  describe('getContractsByNetwork', () => {
    it('should return contracts for specific network', async () => {
      const contracts = await contractService.getContractsByNetwork('Passethub');
      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      contracts.forEach(contract => {
        expect(contract.network).toBe('Passethub');
      });
    });
  });

  describe('getContractsByType', () => {
    it('should return contracts for specific type', async () => {
      const contracts = await contractService.getContractsByType('solidity');
      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      contracts.forEach(contract => {
        expect(contract.contractType).toBe('solidity');
      });
    });
  });

  describe('searchContracts', () => {
    it('should return contracts matching search query', async () => {
      const contracts = await contractService.searchContracts('DeFi');
      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBeGreaterThan(0);
      expect(contracts[0].name).toContain('DeFi');
    });

    it('should return empty array for non-matching query', async () => {
      const contracts = await contractService.searchContracts('NonExistentContract');
      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBe(0);
    });
  });
}); 