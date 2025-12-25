import request from 'supertest';
import app from '../../src/app';

describe('Contracts API Integration Tests', () => {
  describe('GET /api/contracts', () => {
    it('should return all contracts', async () => {
      const response = await request(app)
        .get('/api/contracts')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/contracts/:id', () => {
    it('should return contract when ID exists', async () => {
      const response = await request(app)
        .get('/api/contracts/1')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe('1');
      expect(response.body.name).toBe('DeFi Swap Contract');
    });

    it('should return 404 when ID does not exist', async () => {
      await request(app)
        .get('/api/contracts/999')
        .expect(404);
    });
  });

  describe('POST /api/contracts', () => {
    it('should create a new contract', async () => {
      const contractData = {
        name: 'Integration Test Contract',
        network: 'Passethub',
        contractType: 'solidity',
        solidityAddress: '0x9999...8888'
      };

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Integration Test Contract');
      expect(response.body.network).toBe('Passethub');
      expect(response.body.contractType).toBe('solidity');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: 'Invalid Contract'
        // Missing required fields
      };

      await request(app)
        .post('/api/contracts')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/contracts/:id', () => {
    it('should update existing contract', async () => {
      const updateData = {
        name: 'Updated Integration Contract',
        network: 'Passethub',
        contractType: 'both'
      };

      const response = await request(app)
        .put('/api/contracts/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Updated Integration Contract');
      expect(response.body.contractType).toBe('both');
    });

    it('should return 404 when contract does not exist', async () => {
      const updateData = {
        name: 'Updated Contract'
      };

      await request(app)
        .put('/api/contracts/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/contracts/:id', () => {
    it('should delete existing contract', async () => {
      await request(app)
        .delete('/api/contracts/3')
        .expect(204);
    });

    it('should return 404 when contract does not exist', async () => {
      await request(app)
        .delete('/api/contracts/999')
        .expect(404);
    });
  });

  describe('GET /api/contracts/network/:network', () => {
    it('should return contracts for specific network', async () => {
      const response = await request(app)
        .get('/api/contracts/network/Passethub')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((contract: any) => {
        expect(contract.network).toBe('Passethub');
      });
    });
  });

  describe('GET /api/contracts/type/:type', () => {
    it('should return contracts for specific type', async () => {
      const response = await request(app)
        .get('/api/contracts/type/solidity')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((contract: any) => {
        expect(contract.contractType).toBe('solidity');
      });
    });
  });

  describe('GET /api/contracts/search/:query', () => {
    it('should return contracts matching search query', async () => {
      const response = await request(app)
        .get('/api/contracts/search/Contract')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain('Contract');
    });

    it('should return empty array for non-matching query', async () => {
      const response = await request(app)
        .get('/api/contracts/search/NonExistentContract')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
}); 