/**
 * Integration Tests for Material Prices API
 * Tests CRUD operations, price history tracking, and date filtering
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api/master/materials/prices';

// Test data
const testPrice = {
  materialCode: 'PRICE-TEST-001',
  location: 'Test Location',
  unitPrice: 100.50,
  effectiveDate: '2024-01-01',
  supplier: 'Test Supplier',
  notes: 'Test price entry',
};

let createdId: string;

describe('Material Prices API', () => {
  describe('POST /api/master/materials/prices', () => {
    it('should create a new price record', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPrice),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.materialCode).toBe(testPrice.materialCode);
      expect(data.data.unitPrice).toBe(testPrice.unitPrice);
      expect(data.data.location).toBe(testPrice.location);
      
      createdId = data.data._id;
    });

    it('should uppercase material code', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testPrice,
          materialCode: 'lowercase-code',
          effectiveDate: '2024-01-02',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.materialCode).toBe('LOWERCASE-CODE');
    });

    it('should allow duplicate material codes for price history', async () => {
      // Create first price
      const price1 = {
        ...testPrice,
        materialCode: 'PRICE-DUP-001',
        unitPrice: 100,
        effectiveDate: '2024-01-01',
      };

      const response1 = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(price1),
      });

      expect(response1.status).toBe(201);

      // Create second price for same material (different date)
      const price2 = {
        ...testPrice,
        materialCode: 'PRICE-DUP-001',
        unitPrice: 120,
        effectiveDate: '2024-02-01',
      };

      const response2 = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(price2),
      });

      const data2 = await response2.json();
      
      expect(response2.status).toBe(201);
      expect(data2.success).toBe(true);
    });

    it('should reject negative prices', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testPrice,
          materialCode: 'PRICE-NEG',
          unitPrice: -50,
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
          materialCode: 'PRICE-INCOMPLETE',
          // Missing unitPrice, location, effectiveDate
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid date format', async () => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testPrice,
          materialCode: 'PRICE-BADDATE',
          effectiveDate: 'invalid-date',
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should support bulk import', async () => {
      const bulkData = [
        { ...testPrice, materialCode: 'BULK-PRICE-001', effectiveDate: '2024-01-01' },
        { ...testPrice, materialCode: 'BULK-PRICE-002', effectiveDate: '2024-01-02' },
        { ...testPrice, materialCode: 'BULK-PRICE-003', effectiveDate: '2024-01-03' },
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

  describe('GET /api/master/materials/prices', () => {
    it('should list all price records', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeGreaterThan(0);
    });

    it('should filter by material code', async () => {
      const response = await fetch(`${API_BASE}?materialCode=PRICE-TEST-001`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => price.materialCode === 'PRICE-TEST-001')).toBe(true);
    });

    it('should filter by location', async () => {
      const response = await fetch(`${API_BASE}?location=Test Location`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => price.location === 'Test Location')).toBe(true);
    });

    it('should filter by date range (from)', async () => {
      const response = await fetch(`${API_BASE}?dateFrom=2024-01-01`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => 
        new Date(price.effectiveDate) >= new Date('2024-01-01')
      )).toBe(true);
    });

    it('should filter by date range (to)', async () => {
      const response = await fetch(`${API_BASE}?dateTo=2024-02-01`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => 
        new Date(price.effectiveDate) <= new Date('2024-02-01')
      )).toBe(true);
    });

    it('should filter by date range (both from and to)', async () => {
      const response = await fetch(`${API_BASE}?dateFrom=2024-01-01&dateTo=2024-01-31`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => {
        const date = new Date(price.effectiveDate);
        return date >= new Date('2024-01-01') && date <= new Date('2024-01-31');
      })).toBe(true);
    });

    it('should sort by effective date descending', async () => {
      const response = await fetch(`${API_BASE}?sortBy=effectiveDate&order=desc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const dates = data.data.map((price: any) => new Date(price.effectiveDate).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    });

    it('should sort by unit price ascending', async () => {
      const response = await fetch(`${API_BASE}?sortBy=unitPrice&order=asc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const prices = data.data.map((price: any) => price.unitPrice);
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sorted);
    });

    it('should combine multiple filters', async () => {
      const response = await fetch(`${API_BASE}?materialCode=PRICE-DUP-001&dateFrom=2024-01-01&dateTo=2024-12-31`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.every((price: any) => {
        const date = new Date(price.effectiveDate);
        return price.materialCode === 'PRICE-DUP-001' &&
               date >= new Date('2024-01-01') &&
               date <= new Date('2024-12-31');
      })).toBe(true);
    });

    it('should return price history for a material', async () => {
      const response = await fetch(`${API_BASE}?materialCode=PRICE-DUP-001&sortBy=effectiveDate&order=desc`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(2);
      
      // Verify dates are in descending order
      const dates = data.data.map((price: any) => new Date(price.effectiveDate).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  describe('GET /api/master/materials/prices/:id', () => {
    it('should get specific price record', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data._id).toBe(createdId);
      expect(data.data.materialCode).toBe(testPrice.materialCode);
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

  describe('PATCH /api/master/materials/prices/:id', () => {
    it('should update price record', async () => {
      const updates = {
        unitPrice: 150.75,
        supplier: 'Updated Supplier',
        notes: 'Updated notes',
      };

      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.unitPrice).toBe(150.75);
      expect(data.data.supplier).toBe('Updated Supplier');
      expect(data.data.notes).toBe('Updated notes');
    });

    it('should uppercase material code on update', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialCode: 'updated-lowercase' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.materialCode).toBe('UPDATED-LOWERCASE');
    });

    it('should update effective date', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveDate: '2024-06-01' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.effectiveDate.startsWith('2024-06-01')).toBe(true);
    });

    it('should reject negative prices', async () => {
      const response = await fetch(`${API_BASE}/${createdId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitPrice: -100 }),
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
        body: JSON.stringify({ unitPrice: 200 }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/master/materials/prices/:id', () => {
    it('should delete price record', async () => {
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
    
    for (const price of data.data) {
      if (price.materialCode.startsWith('PRICE-') || 
          price.materialCode.startsWith('BULK-PRICE') ||
          price.materialCode === 'LOWERCASE-CODE') {
        await fetch(`${API_BASE}/${price._id}`, { method: 'DELETE' });
      }
    }
  });
});
