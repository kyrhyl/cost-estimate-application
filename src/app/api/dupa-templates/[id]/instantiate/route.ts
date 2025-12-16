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

    // Instantiate labor entries
    const laborEntries = await Promise.all(
      template.laborTemplate.map(async (labor) => {
        const rateField = labor.designation.toLowerCase().replace(/\s+/g, '');
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

    // Instantiate equipment entries
    const equipmentEntries = await Promise.all(
      template.equipmentTemplate.map(async (equip) => {
        let hourlyRateOperating = 0;
        let hourlyRateIdle = 0;
        let description = equip.description;

        if (equip.equipmentId) {
          const equipment = await Equipment.findById(equip.equipmentId).lean();
          if (equipment) {
            hourlyRateOperating = equipment.hourlyRateOperating;
            hourlyRateIdle = equipment.hourlyRateIdle;
            description = equipment.description;
          }
        }

        // Use operating rate for calculation
        const hourlyRate = hourlyRateOperating;
        
        return {
          nameAndCapacity: description,
          noOfUnits: equip.noOfUnits,
          noOfHours: equip.noOfHours,
          hourlyRate,
          amount: equip.noOfUnits * equip.noOfHours * hourlyRate,
        };
      })
    );

    // Handle Minor Tools (10% of labor cost)
    const laborCost = laborEntries.reduce((sum, labor) => sum + labor.amount, 0);
    const minorToolsEntry = {
      nameAndCapacity: 'Minor Tools (10% of Labor Cost)',
      noOfUnits: 1,
      noOfHours: 1,
      hourlyRate: laborCost * 0.1,
      amount: laborCost * 0.1,
    };
    equipmentEntries.push(minorToolsEntry);

    // Instantiate material entries
    const materialEntries = await Promise.all(
      template.materialTemplate.map(async (material) => {
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

          const price = await MaterialPrice.findOne(priceQuery)
            .sort({ effectiveDate: -1 })
            .lean();
          
          if (price) {
            unitCost = price.unitPrice;
          }
        }

        return {
          nameAndSpecification: material.description,
          unit: material.unit,
          quantity: material.quantity,
          unitCost,
          amount: material.quantity * unitCost,
        };
      })
    );

    // Create RateItem from instantiated template
    const rateItem = new RateItem({
      payItemNumber: template.payItemNumber,
      payItemDescription: template.payItemDescription,
      unitOfMeasurement: template.unitOfMeasurement,
      outputPerHourSubmitted: template.outputPerHour,
      outputPerHourEvaluated: template.outputPerHour,
      
      // Submitted arrays
      laborSubmitted: useEvaluated ? [] : laborEntries,
      equipmentSubmitted: useEvaluated ? [] : equipmentEntries,
      materialsSubmitted: useEvaluated ? [] : materialEntries,
      
      // Evaluated arrays
      laborEvaluated: useEvaluated ? laborEntries : [],
      equipmentEvaluated: useEvaluated ? equipmentEntries : [],
      materialsEvaluated: useEvaluated ? materialEntries : [],
      
      // Add-on percentages
      addOnPercentages: {
        ocmSubmitted: useEvaluated ? 0 : template.ocmPercentage,
        ocmEvaluated: useEvaluated ? template.ocmPercentage : 0,
        cpSubmitted: useEvaluated ? 0 : template.cpPercentage,
        cpEvaluated: useEvaluated ? template.cpPercentage : 0,
        vatSubmitted: useEvaluated ? 0 : template.vatPercentage,
        vatEvaluated: useEvaluated ? template.vatPercentage : 0,
      },
    });

    await rateItem.save();

    return NextResponse.json(
      {
        success: true,
        data: rateItem,
        message: `Template instantiated successfully for location: ${location}`,
      },
      { status: 201 }
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
