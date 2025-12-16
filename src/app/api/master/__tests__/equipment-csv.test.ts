/**
 * Integration Tests for Equipment CSV Import API
 * Tests CSV parsing, header mapping, and import options
 */

import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE = 'http://localhost:3000/api/master/equipment';
const CSV_ENDPOINT = `${API_BASE}/import-csv`;

describe('Equipment CSV Import API', () => {
  beforeEach(async () => {
    // Clean existing data before each test
    await fetch(`${API_BASE}?confirm=true`, { method: 'DELETE' });
  });

  describe('POST /api/master/equipment/import-csv', () => {
    it('should import valid CSV data', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-001,Test Equipment 1,Complete Desc 1,MODEL-1,100,50,1000,500
CSV-002,Test Equipment 2,Complete Desc 2,MODEL-2,200,100,2000,1000`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].no).toBe('CSV-001');
      expect(data.data[1].no).toBe('CSV-002');
    });

    it('should handle header variations (No -> #)', async () => {
      const csvData = `#,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-003,Equipment 3,Complete 3,M3,300,150,3000,1500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data[0].no).toBe('CSV-003');
    });

    it('should handle header variations (Horsepower -> HP)', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,Horsepower,Hourly Rate Operating,Hourly Rate Idle
CSV-004,Equipment 4,Complete 4,M4,400,200,4000,2000`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data[0].hp).toBe(200);
    });

    it('should handle quoted fields with commas', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-005,"Equipment, with comma","Complete description, also with comma",M5,500,250,5000,2500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data[0].description).toBe('Equipment, with comma');
      expect(data.data[0].completeDescription).toBe('Complete description, also with comma');
    });

    it('should handle numeric strings correctly', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-006,Equipment 6,Complete 6,M6,"600 tons",300,"6,000.50","3,000.25"`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data[0].capacity).toBe('600 tons');
      expect(data.data[0].hp).toBe(300);
      expect(data.data[0].hourlyRateOperating).toBe(6000.50);
      expect(data.data[0].hourlyRateIdle).toBe(3000.25);
    });

    it('should skip duplicates when skipDuplicates=true', async () => {
      // First import
      const csvData1 = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
DUP-001,Original Equipment,Original Desc,M1,100,50,1000,500`;

      await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvData1 }),
      });

      // Second import with duplicate and new
      const csvData2 = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
DUP-001,Duplicate Equipment,Duplicate Desc,M1,100,50,1000,500
DUP-002,New Equipment,New Desc,M2,200,100,2000,1000`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          csvData: csvData2,
          options: { skipDuplicates: true }
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(1); // Only new one imported
      expect(data.skipped).toBe(1);
    });

    it('should clear existing when clearExisting=true', async () => {
      // First import
      const csvData1 = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CLR-001,Old Equipment 1,Old Desc 1,M1,100,50,1000,500
CLR-002,Old Equipment 2,Old Desc 2,M2,200,100,2000,1000`;

      await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvData1 }),
      });

      // Second import with clearExisting
      const csvData2 = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CLR-003,New Equipment,New Desc,M3,300,150,3000,1500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          csvData: csvData2,
          options: { clearExisting: true }
        }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);

      // Verify old data is gone
      const listResponse = await fetch(API_BASE);
      const listData = await listResponse.json();
      
      expect(listData.count).toBe(1);
      expect(listData.data[0].no).toBe('CLR-003');
    });

    it('should reject CSV without headers', async () => {
      const csvData = `CSV-007,Equipment 7,Complete 7,M7,700,350,7000,3500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('header');
    });

    it('should reject CSV with missing required columns', async () => {
      const csvData = `No,Description
CSV-008,Equipment 8`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should reject malformed CSV', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-009,"Unclosed quote,Equipment 9,Complete 9,M9,900,450,9000,4500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid data types', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-010,Equipment 10,Complete 10,M10,1000,INVALID,10000,5000`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should provide detailed error messages for invalid rows', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle
CSV-011,Valid Equipment,Complete 11,M11,1100,550,11000,5500
CSV-012,Missing Rate,Complete 12,M12,1200,600
CSV-013,Valid Equipment 2,Complete 13,M13,1300,650,13000,6500`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/row 3|CSV-012/);
    });

    it('should handle empty CSV', async () => {
      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: '' }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle CSV with only headers', async () => {
      const csvData = `No,Description,Complete Description,Model,Capacity,HP,Hourly Rate Operating,Hourly Rate Idle`;

      const response = await fetch(CSV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No data rows');
    });
  });
});
