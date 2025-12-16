/**
 * Integration Tests for Equipment API
 * Tests CRUD operations, validation, filtering, and bulk operations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api/master/equipment';

// Test data
const testEquipment = {
  no: 'TEST-001',
  description: 'Test Equipment',
  completeDescription: 'Test Equipment Complete Description',
  model: 'TEST-MODEL',
  capacity: '100',
  hp: 50,
  hourlyRateOperating: 1000,
  hourlyRateIdle: 500,
};

let createdId: string;

describe('Equipment API', () => {
  describe('POST /api/master/equipment', () => {
    it('should create new equipment', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEquipment),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.no).toBe(testEquipment.no);
      expect(data.data.description).toBe(testEquipment.description);
      
      createdId = data.data._id;
    });

    it('should reject duplicate equipment number', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEquipment),
      });

      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('should reject missing required fields', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no: 'TEST-002',
          // Missing description
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject negative rates', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testEquipment,
          no: 'TEST-NEG',
          hourlyRateOperating: -100,
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should support bulk import', async () => {
      const bulkData = [
        { ...testEquipment, no: 'BULK-001' },
        { ...testEquipment, no: 'BULK-002' },
        { ...testEquipment, no: 'BULK-003' },
      ];

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(3);
      expect(data.data).toHaveLength(3);
    });
  });

  describe('GET /api/master/equipment', () => {
    it('should list all equipment', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('should search by description', async () => {
      const response = await fetch(`${API_BASE}?search=Test`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((eq: any) => 
        eq.description.includes('Test') || eq.completeDescription.includes('Test')
      )).toBe(true);
    });

    it('should filter by rate range', async () => {
      const response = await fetch(`${API_BASE}?minRate=500&maxRate=1500`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((eq: any) => 
        eq.hourlyRateOperating >= 500 && eq.hourlyRateOperating <= 1500
      )).toBe(true);
    });

    it('should sort results', async () => {
      const response = await fetch(`${API_BASE}?sortBy=no&order=asc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const numbers = data.data.map((eq: any) => eq.no);
      const sorted = [...numbers].sort();
      expect(numbers).toEqual(sorted);
    });

    it('should sort by hourly rate', async () => {
      const response = await fetch(`${API_BASE}?sortBy=hourlyRateOperating&order=desc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const rates = data.data.map((eq: any) => eq.hourlyRateOperating);
      const sorted = [...rates].sort((a: number, b: number) => b - a);
      expect(rates).toEqual(sorted);
    });
  });

  describe('GET /api/master/equipment/:id', () => {
    it('should get specific equipment', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe(createdId);
      expect(data.data.no).toBe(testEquipment.no);
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

  describe('PATCH /api/master/equipment/:id', () => {
    it('should update equipment', async () => {
      const updates = {
        description: 'Updated Test Equipment',
        hourlyRateOperating: 1200,
      };

      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('Updated Test Equipment');
      expect(data.data.hourlyRateOperating).toBe(1200);
    });

    it('should reject duplicate equipment number', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no: 'BULK-001' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });

    it('should reject negative rates', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRateOperating: -500 }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await fetch(`${API_BASE}/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Update' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/master/equipment/:id', () => {
    it('should delete equipment', async () => {
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

  describe('DELETE /api/master/equipment (bulk)', () => {
    it('should require confirmation', async () => {
      const response = await fetch(API_BASE, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('confirm=true');
    });

    it('should delete all with confirmation', async () => {
      const response = await fetch(`${API_BASE}?confirm=true`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toBeGreaterThan(0);
    });

    it('should return empty list after bulk delete', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(0);
    });
  });

  // Re-create test data for other tests if needed
  beforeAll(async () => {
    // Ensure clean state
    const deleteResponse = await fetch(`${API_BASE}?confirm=true`, {
      method: 'DELETE',
    });
  });
});
