/**
 * Integration Tests for Materials API
 * Tests CRUD operations, filtering, and active status management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api/master/materials';

// Test data
const testMaterial = {
  materialCode: 'TEST-MAT-001',
  description: 'Test Material',
  unit: 'kg',
  category: 'Test Category',
  specifications: 'Test specifications',
  isActive: true,
};

let createdId: string;

describe('Materials API', () => {
  describe('POST /api/master/materials', () => {
    it('should create a new material', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMaterial),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.materialCode).toBe(testMaterial.materialCode);
      expect(data.data.description).toBe(testMaterial.description);
      expect(data.data.isActive).toBe(true);
      
      createdId = data.data._id;
    });

    it('should uppercase material code', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testMaterial,
          materialCode: 'test-mat-lower',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.materialCode).toBe('TEST-MAT-LOWER');
    });

    it('should default isActive to true', async () => {
      const { isActive, ...materialWithoutActive } = testMaterial;
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...materialWithoutActive,
          materialCode: 'TEST-MAT-DEFAULT',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(true);
    });

    it('should reject duplicate material code', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMaterial),
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
          materialCode: 'TEST-MAT-INCOMPLETE',
          // Missing description and unit
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should support bulk import', async () => {
      const bulkData = [
        { ...testMaterial, materialCode: 'BULK-MAT-001' },
        { ...testMaterial, materialCode: 'BULK-MAT-002' },
        { ...testMaterial, materialCode: 'BULK-MAT-003' },
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

  describe('GET /api/master/materials', () => {
    it('should list all materials', async () => {
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
      expect(data.data.every((mat: any) => 
        mat.description.includes('Test') || mat.materialCode.includes('TEST')
      )).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await fetch(`${API_BASE}?category=Test Category`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((mat: any) => mat.category === 'Test Category')).toBe(true);
    });

    it('should filter by active status', async () => {
      const response = await fetch(`${API_BASE}?isActive=true`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((mat: any) => mat.isActive === true)).toBe(true);
    });

    it('should filter inactive materials', async () => {
      // First create an inactive material
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testMaterial,
          materialCode: 'INACTIVE-MAT',
          isActive: false,
        }),
      });

      const response = await fetch(`${API_BASE}?isActive=false`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((mat: any) => mat.isActive === false)).toBe(true);
    });

    it('should sort results', async () => {
      const response = await fetch(`${API_BASE}?sortBy=materialCode&order=asc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const codes = data.data.map((mat: any) => mat.materialCode);
      const sorted = [...codes].sort();
      expect(codes).toEqual(sorted);
    });

    it('should combine multiple filters', async () => {
      const response = await fetch(`${API_BASE}?category=Test Category&isActive=true&search=Test`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((mat: any) => 
        mat.category === 'Test Category' && 
        mat.isActive === true &&
        (mat.description.includes('Test') || mat.materialCode.includes('TEST'))
      )).toBe(true);
    });
  });

  describe('GET /api/master/materials/:id', () => {
    it('should get specific material', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe(createdId);
      expect(data.data.materialCode).toBe(testMaterial.materialCode);
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

  describe('PATCH /api/master/materials/:id', () => {
    it('should update material description', async () => {
      const updates = {
        description: 'Updated Test Material',
        specifications: 'Updated specifications',
      };

      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('Updated Test Material');
      expect(data.data.specifications).toBe('Updated specifications');
    });

    it('should toggle active status', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(false);

      // Toggle back
      const response2 = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      const data2 = await response2.json();
      expect(data2.data.isActive).toBe(true);
    });

    it('should uppercase material code on update', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialCode: 'updated-code-lowercase' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.materialCode).toBe('UPDATED-CODE-LOWERCASE');
    });

    it('should reject duplicate material code', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialCode: 'BULK-MAT-001' }),
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
        body: JSON.stringify({ description: 'Update' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/master/materials/:id', () => {
    it('should delete material', async () => {
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
    // Delete test data
    const response = await fetch(API_BASE);
    const data = await response.json();
    
    for (const material of data.data) {
      if (material.materialCode.startsWith('BULK-MAT') || 
          material.materialCode.startsWith('TEST-MAT') ||
          material.materialCode === 'INACTIVE-MAT') {
        await fetch(`${API_BASE}/${material._id}`, { method: 'DELETE' });
      }
    }
  });
});
