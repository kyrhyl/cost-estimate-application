/**
 * Integration Tests for Labor Rates API
 * Tests all CRUD operations, validation, and error handling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api/master/labor';

// Test data
const testLaborRate = {
  location: 'Test City',
  district: 'Test District',
  foreman: 500,
  leadman: 450,
  equipmentOperatorHeavy: 400,
  equipmentOperatorHighSkilled: 380,
  equipmentOperatorLightSkilled: 350,
  driver: 320,
  laborSkilled: 300,
  laborSemiSkilled: 280,
  laborUnskilled: 250,
};

let createdId: string;

describe('Labor Rates API', () => {
  describe('POST /api/master/labor', () => {
    it('should create a new labor rate', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLaborRate),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.location).toBe(testLaborRate.location);
      expect(data.data.foreman).toBe(testLaborRate.foreman);
      
      createdId = data.data._id;
    });

    it('should reject duplicate location', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testLaborRate),
      });

      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('should reject invalid data (negative rates)', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testLaborRate,
          location: 'Invalid City',
          foreman: -100,
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'Incomplete City',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should support bulk import', async () => {
      const bulkData = [
        { ...testLaborRate, location: 'Bulk City 1' },
        { ...testLaborRate, location: 'Bulk City 2' },
      ];

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
      expect(data.data).toHaveLength(2);
    });
  });

  describe('GET /api/master/labor', () => {
    it('should list all labor rates', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('should filter by location', async () => {
      const response = await fetch(`${API_BASE}?location=Test`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((rate: any) => rate.location.includes('Test'))).toBe(true);
    });

    it('should filter by district', async () => {
      const response = await fetch(`${API_BASE}?district=Test District`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((rate: any) => rate.district === 'Test District')).toBe(true);
    });

    it('should sort results', async () => {
      const response = await fetch(`${API_BASE}?sortBy=location&order=asc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const locations = data.data.map((rate: any) => rate.location);
      const sorted = [...locations].sort();
      expect(locations).toEqual(sorted);
    });
  });

  describe('GET /api/master/labor/:id', () => {
    it('should get a specific labor rate', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe(createdId);
      expect(data.data.location).toBe(testLaborRate.location);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${API_BASE}/${fakeId}`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await fetch(`${API_BASE}/invalid-id`);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/master/labor/:id', () => {
    it('should update a labor rate', async () => {
      const updates = {
        foreman: 550,
        leadman: 500,
      };

      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.foreman).toBe(550);
      expect(data.data.leadman).toBe(500);
    });

    it('should reject negative rates', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foreman: -100 }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject duplicate location on update', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Bulk City 1' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${API_BASE}/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foreman: 600 }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/master/labor/:id', () => {
    it('should delete a labor rate', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe(createdId);
    });

    it('should return 404 after deletion', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${API_BASE}/${fakeId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  // Cleanup
  afterAll(async () => {
    // Delete bulk test data
    const response = await fetch(API_BASE);
    const data = await response.json();
    
    for (const rate of data.data) {
      if (rate.location.startsWith('Bulk City')) {
        await fetch(`${API_BASE}/${rate._id}`, { method: 'DELETE' });
      }
    }
  });
});
