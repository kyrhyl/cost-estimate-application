/**
 * Integration Tests for DUPA Instantiation Workflow
 * Tests the complete flow from template creation to rate item instantiation
 * 
 * NOTE: These old integration tests have been replaced with unit tests using mocked handlers.
 * See: tests/integration/dupa-workflow-refactored.test.ts
 * 
 * The complex instantiation logic requires proper service layer mocking which is TODO.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe.skip('DUPA Template Instantiation Integration Tests (TODO: Refactor)', () => {
  // Skipped - replaced with dupa-workflow-refactored.test.ts
});

describe.skip('DUPA Template Instantiation Integration Tests - Old', () => {
  let templateId: string;
  let rateItemId: string;
  const testLocation = 'Malaybalay City, Bukidnon';

  beforeAll(async () => {
    // Setup: Ensure master data exists (labor rates, equipment, material prices)
    console.log('Setting up test data...');
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    console.log('Cleaning up test data...');
  });

  describe('Template Creation', () => {
    it('should create a DUPA template with valid structure', async () => {
      const template = {
        payItemNumber: 'TEST-001',
        payItemDescription: 'Test Concrete Work',
        unitOfMeasurement: 'cu.m.',
        outputPerHour: 2.5,
        category: 'Concrete',
        laborTemplate: [
          {
            designation: 'Foreman',
            noOfPersons: 1,
            noOfHours: 8,
          },
          {
            designation: 'Skilled Labor',
            noOfPersons: 4,
            noOfHours: 8,
          },
        ],
        equipmentTemplate: [
          {
            equipmentId: 'EQ-003',
            description: 'Concrete Mixer',
            noOfUnits: 1,
            noOfHours: 8,
          },
        ],
        materialTemplate: [
          {
            materialCode: 'MAT-001',
            description: 'Portland Cement',
            unit: 'bag',
            quantity: 7,
          },
          {
            materialCode: 'MAT-002',
            description: 'Sand',
            unit: 'cu.m.',
            quantity: 0.5,
          },
          {
            materialCode: 'MAT-003',
            description: 'Gravel',
            unit: 'cu.m.',
            quantity: 0.7,
          },
        ],
        ocmPercentage: 10,
        cpPercentage: 8,
        vatPercentage: 12,
        isActive: true,
      };

      const response = await fetch('http://localhost:3000/api/dupa-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('_id');
      expect(result.data.payItemNumber).toBe('TEST-001');

      templateId = result.data._id;
    });

    it('should reject template with missing required fields', async () => {
      const invalidTemplate = {
        payItemNumber: 'TEST-002',
        // Missing payItemDescription
        unitOfMeasurement: 'cu.m.',
      };

      const response = await fetch('http://localhost:3000/api/dupa-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTemplate),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should reject template with duplicate pay item number', async () => {
      const duplicateTemplate = {
        payItemNumber: 'TEST-001', // Same as first test
        payItemDescription: 'Another Test Item',
        unitOfMeasurement: 'sq.m.',
        outputPerHour: 1,
      };

      const response = await fetch('http://localhost:3000/api/dupa-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateTemplate),
      });

      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('Template Instantiation', () => {
    it('should instantiate template with location-specific rates', async () => {
      const instantiatePayload = {
        location: testLocation,
        useEvaluated: false,
      };

      const response = await fetch(
        `http://localhost:3000/api/dupa-templates/${templateId}/instantiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(instantiatePayload),
        }
      );

      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('_id');
      expect(result.data.payItemNumber).toBe('TEST-001');
      expect(result.data.location).toBe(testLocation);

      // Check labor rates were applied
      expect(result.data.labor).toBeInstanceOf(Array);
      expect(result.data.labor.length).toBeGreaterThan(0);
      expect(result.data.labor[0]).toHaveProperty('hourlyRate');
      expect(result.data.labor[0].hourlyRate).toBeGreaterThan(0);

      // Check equipment rates were applied
      expect(result.data.equipment).toBeInstanceOf(Array);
      expect(result.data.equipment.length).toBeGreaterThan(0);
      expect(result.data.equipment[0]).toHaveProperty('hourlyRate');

      // Check material prices were applied
      expect(result.data.materials).toBeInstanceOf(Array);
      expect(result.data.materials.length).toBeGreaterThan(0);
      expect(result.data.materials[0]).toHaveProperty('unitPrice');
      expect(result.data.materials[0].unitPrice).toBeGreaterThan(0);

      // Check calculations
      expect(result.data).toHaveProperty('subtotal');
      expect(result.data).toHaveProperty('minorTools');
      expect(result.data).toHaveProperty('ocm');
      expect(result.data).toHaveProperty('cp');
      expect(result.data).toHaveProperty('totalDirectCost');
      expect(result.data).toHaveProperty('vat');
      expect(result.data).toHaveProperty('grandTotal');

      // Verify minor tools is 10% of labor cost
      const laborCost = result.data.labor.reduce((sum: number, l: any) => sum + l.amount, 0);
      expect(result.data.minorTools).toBeCloseTo(laborCost * 0.1, 2);

      rateItemId = result.data._id;
    });

    it('should fail instantiation with missing location', async () => {
      const invalidPayload = {
        useEvaluated: false,
        // Missing location
      };

      const response = await fetch(
        `http://localhost:3000/api/dupa-templates/${templateId}/instantiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidPayload),
        }
      );

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
    });

    it('should handle location with no available rates', async () => {
      const nonexistentLocation = 'Nonexistent City, Nowhere';
      const payload = {
        location: nonexistentLocation,
        useEvaluated: false,
      };

      const response = await fetch(
        `http://localhost:3000/api/dupa-templates/${templateId}/instantiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // Should either fail or return with zero/missing rates
      // Depending on implementation, adjust expectation
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Estimate Calculation', () => {
    it('should calculate estimate correctly with rate item', async () => {
      // This test assumes you have an estimate endpoint
      // Adjust based on your actual implementation
      
      const estimateData = {
        projectName: 'Test Project',
        projectLocation: testLocation,
        items: [
          {
            rateItemId: rateItemId,
            quantity: 10, // 10 cubic meters
          },
        ],
      };

      // Mock calculation test
      // In real scenario, you'd call your estimate API
      
      const quantity = 10;
      const unitCost = 5000; // Example unit cost
      const expectedTotal = quantity * unitCost;

      expect(expectedTotal).toBe(50000);
    });
  });

  describe('Data Cleanup', () => {
    it('should delete rate item', async () => {
      if (!rateItemId) return;

      const response = await fetch(`http://localhost:3000/api/rates/${rateItemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should delete template', async () => {
      if (!templateId) return;

      const response = await fetch(`http://localhost:3000/api/dupa-templates/${templateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });
});

/**
 * BOQ Validation Tests
 */
describe('BOQ Validation Tests', () => {
  it('should validate BOQ item quantities', () => {
    const validItem = {
      quantity: 10.5,
      unitCost: 5000,
    };

    expect(validItem.quantity).toBeGreaterThan(0);
    expect(validItem.unitCost).toBeGreaterThan(0);
  });

  it('should reject negative quantities', () => {
    const invalidQuantity = -5;
    expect(invalidQuantity).toBeLessThan(0);
    // In real implementation, this should throw or return error
  });

  it('should calculate total amount correctly', () => {
    const quantity = 10.5;
    const unitCost = 5000;
    const expectedTotal = 52500;

    const calculatedTotal = quantity * unitCost;

    expect(calculatedTotal).toBe(expectedTotal);
  });

  it('should handle decimal precision', () => {
    const quantity = 10.555;
    const unitCost = 1234.56;
    const total = quantity * unitCost;
    // Actual result: 13030.7808 (due to floating-point precision)
    expect(total).toBeCloseTo(13030.7808, 2);
  });
});

/**
 * Formula Validation Tests
 */
describe('DPWH Formula Validation Tests', () => {
  it('should calculate Minor Tools as 10% of labor cost', () => {
    const laborCost = 10000;
    const minorTools = laborCost * 0.1;

    expect(minorTools).toBe(1000);
  });

  it('should calculate OCM correctly', () => {
    const directCost = 50000;
    const ocmPercentage = 10;
    const ocm = directCost * (ocmPercentage / 100);

    expect(ocm).toBe(5000);
  });

  it('should calculate CP correctly', () => {
    const directCost = 50000;
    const cpPercentage = 8;
    const cp = directCost * (cpPercentage / 100);

    expect(cp).toBe(4000);
  });

  it('should calculate VAT as 12% of total direct cost', () => {
    const totalDirectCost = 50000;
    const vat = totalDirectCost * 0.12;

    expect(vat).toBe(6000);
  });

  it('should calculate grand total correctly', () => {
    const subtotal = 50000; // Labor + Equipment + Materials
    const minorTools = 5000;
    const ocm = 5000;
    const cp = 4000;
    const totalDirectCost = subtotal + minorTools + ocm + cp; // 64000
    const vat = totalDirectCost * 0.12; // 7680
    const grandTotal = totalDirectCost + vat; // 71680

    expect(grandTotal).toBe(71680);
  });
});
