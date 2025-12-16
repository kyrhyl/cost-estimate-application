/**
 * POST /api/dupa-templates/:id/instantiate
 * Instantiate a DUPA template with location-specific rates
 * 
 * Converts template into actual RateItem by fetching current rates:
 * - Labor rates from LaborRate model (by location)
 * - Equipment rates from Equipment model (by equipmentId)
 * - Material prices from MaterialPrice model (by materialCode + location)
 */

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import DUPATemplate from '@/models/DUPATemplate';
import RateItem from '@/models/RateItem';
import LaborRate from '@/models/LaborRate';
import Equipment from '@/models/Equipment';
import MaterialPrice from '@/models/MaterialPrice';
import mongoose from 'mongoose';
import { z } from 'zod';

const InstantiateRequestSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  useEvaluated: z.boolean().default(false),
  effectiveDate: z.string().optional(), // For fetching historical prices
  projectId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID format' },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    let validated;
    try {
      validated = InstantiateRequestSchema.parse(body);
    } catch (validationError: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validationError.errors,
        },
        { status: 400 }
      );
    }

    const { location, useEvaluated, effectiveDate } = validated;

    // Fetch template
    const template = await DUPATemplate.findById(id);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'DUPA template not found' },
        { status: 404 }
      );
    }

    // Fetch location-specific labor rates
    const laborRates = await LaborRate.findOne({ location }).lean();
    if (!laborRates) {
      return NextResponse.json(
        {
          success: false,
          error: `No labor rates found for location: ${location}`,
        },
        { status: 404 }
      );
    }

    // Map labor designations to database field names
    const laborRateMap: Record<string, string> = {
      'Foreman': 'foreman',
      'Leadman': 'leadman',
      'Equipment Operator - Heavy': 'equipmentOperatorHeavy',
      'Equipment Operator - High Skilled': 'equipmentOperatorHighSkilled',
      'Equipment Operator - Light Skilled': 'equipmentOperatorLightSkilled',
      'Driver': 'driver',
      'Skilled Labor': 'laborSkilled',
      'Semi-Skilled Labor': 'laborSemiSkilled',
      'Unskilled Labor': 'laborUnskilled',
    };

    // Instantiate labor entries
    const laborEntries = await Promise.all(
      template.laborTemplate.map(async (labor: any) => {
        const rateField = laborRateMap[labor.designation] || labor.designation.toLowerCase().replace(/[\s-]+/g, '');
        const hourlyRate = (laborRates as any)[rateField] || 0;
        
        return {
          designation: labor.designation,
          noOfPersons: labor.noOfPersons,
          noOfHours: labor.noOfHours,
          hourlyRate,
          amount: labor.noOfPersons * labor.noOfHours * hourlyRate,
        };
      })
    );

    // Instantiate equipment entries (filter out empty entries)
    const equipmentEntriesRaw = await Promise.all(
      template.equipmentTemplate
        .filter((equip: any) => equip.equipmentId || equip.description) // Only process entries with data
        .map(async (equip: any) => {
          let hourlyRate = 0;
          let description = equip.description || '';
          let equipmentId = equip.equipmentId || null;

          if (equip.equipmentId) {
            const equipment: any = await Equipment.findById(equip.equipmentId).lean();
            if (equipment) {
              hourlyRate = equipment.hourlyRate || 0;
              description = equipment.description || equipment.completeDescription || description;
              equipmentId = equipment._id;
            }
          }
          
          // Ensure we have a valid description
          if (!description || description.trim() === '') {
            description = 'Equipment Item';
          }
          
          const noOfUnits = Number(equip.noOfUnits) || 0;
          const noOfHours = Number(equip.noOfHours) || 0;
          const amount = noOfUnits * noOfHours * hourlyRate;
          
          return {
            equipmentId: equipmentId || undefined,
            description: description.trim(),
            noOfUnits,
            noOfHours,
            hourlyRate,
            amount: isNaN(amount) ? 0 : amount,
          };
        })
    );
    
    const equipmentEntries = equipmentEntriesRaw;

    // Handle Minor Tools (10% of labor cost)
    const laborCost = laborEntries.reduce((sum, labor) => sum + labor.amount, 0);
    const minorToolsEntry = {
      equipmentId: undefined,
      description: 'Minor Tools (10% of Labor Cost)',
      noOfUnits: 1,
      noOfHours: 1,
      hourlyRate: laborCost * 0.1,
      amount: laborCost * 0.1,
    };
    equipmentEntries.push(minorToolsEntry);

    // Instantiate material entries (filter out empty entries)
    const materialEntries = await Promise.all(
      template.materialTemplate
        .filter((material: any) => material.materialCode && material.description) // Only process valid materials
        .map(async (material: any) => {
          let unitCost = 0;

          if (material.materialCode) {
            // Query for most recent price at location
            const priceQuery: any = {
              materialCode: material.materialCode,
              location,
            };
            
            if (effectiveDate) {
              priceQuery.effectiveDate = { $lte: new Date(effectiveDate) };
            }

            const price: any = await MaterialPrice.findOne(priceQuery)
              .sort({ effectiveDate: -1 })
              .lean();
            
            if (price) {
              unitCost = price.unitCost;
            }
          }

          const quantity = Number(material.quantity) || 0;
          const amount = quantity * unitCost;
          
          return {
            materialCode: material.materialCode.trim(),
            description: material.description.trim() || 'Material Item',
            unit: material.unit.trim() || 'unit',
            quantity,
            unitCost,
            amount: isNaN(amount) ? 0 : amount,
          };
        })
    );

    // Calculate costs
    const laborCostTotal = laborEntries.reduce((sum, item) => sum + item.amount, 0);
    const equipmentCostTotal = equipmentEntries.reduce((sum, item) => sum + item.amount, 0);
    const materialCostTotal = materialEntries.reduce((sum, item) => sum + item.amount, 0);
    
    const directCost = laborCostTotal + equipmentCostTotal + materialCostTotal;
    const ocmCost = directCost * (template.ocmPercentage / 100);
    const cpCost = directCost * (template.cpPercentage / 100);
    const subtotalWithMarkup = directCost + ocmCost + cpCost;
    const vatCost = subtotalWithMarkup * (template.vatPercentage / 100);
    const totalCost = subtotalWithMarkup + vatCost;
    const unitCost = totalCost; // Cost per unit of measurement

    // Return computed data for BOQ creation
    const computedData = {
      payItemNumber: template.payItemNumber,
      payItemDescription: template.payItemDescription,
      unitOfMeasurement: template.unitOfMeasurement,
      outputPerHour: template.outputPerHour,
      category: template.category,
      
      // Computed arrays with rates
      laborComputed: laborEntries,
      equipmentComputed: equipmentEntries,
      materialComputed: materialEntries,
      
      // Cost breakdown
      directCost,
      ocmPercentage: template.ocmPercentage,
      ocmCost,
      cpPercentage: template.cpPercentage,
      cpCost,
      subtotalWithMarkup,
      vatPercentage: template.vatPercentage,
      vatCost,
      totalCost,
      unitCost,
      
      // Metadata
      location,
      instantiatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: computedData,
        message: `Template instantiated successfully for location: ${location}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error instantiating DUPA template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to instantiate DUPA template',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
