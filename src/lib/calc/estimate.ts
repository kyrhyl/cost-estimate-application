import { IRateItem, ILaborEntry, IEquipmentEntry, IMaterialEntry } from '@/models/RateItem';

// =============================================
// Type Definitions
// =============================================

export interface CostBreakdown {
  // Labor costs
  laborSubmitted: number;
  laborEvaluated: number;
  
  // Equipment costs
  equipmentSubmitted: number;
  equipmentEvaluated: number;
  
  // Material costs
  materialSubmitted: number;
  materialEvaluated: number;
  
  // Direct costs (Labor + Equipment + Material)
  directCostSubmitted: number;
  directCostEvaluated: number;
  
  // Add-ons (based on direct cost)
  ocmSubmitted: number;           // Overhead, Contingencies & Miscellaneous
  ocmEvaluated: number;
  cpSubmitted: number;            // Contractor's Profit
  cpEvaluated: number;
  vatSubmitted: number;           // Value Added Tax
  vatEvaluated: number;
  
  // Final totals
  totalSubmitted: number;         // Direct + OCM + CP + VAT (Submitted)
  totalEvaluated: number;         // Direct + OCM + CP + VAT (Evaluated)
}

export interface LineItemEstimate {
  quantity: number;
  unitRate: number;               // Per unit rate (using Submitted or Evaluated)
  totalAmount: number;            // quantity × unitRate
  breakdown: CostBreakdown;
}

// =============================================
// LABOR COST COMPUTATION
// =============================================

/**
 * Compute total labor cost from labor entries
 * Formula: Σ(noOfPersons × noOfHours × hourlyRate)
 */
export function computeLaborCost(laborEntries: ILaborEntry[]): number {
  return laborEntries.reduce((total, entry) => {
    const amount = entry.noOfPersons * entry.noOfHours * entry.hourlyRate;
    return total + amount;
  }, 0);
}

// =============================================
// EQUIPMENT COST COMPUTATION
// =============================================

/**
 * Compute total equipment cost from equipment entries
 * Formula: Σ(noOfUnits × noOfHours × hourlyRate)
 * 
 * Special case: "Minor Tools" is typically 10% of labor cost
 * If nameAndCapacity includes "Minor Tools" and hourlyRate is 0,
 * it should be calculated separately as 10% of labor
 */
export function computeEquipmentCost(
  equipmentEntries: IEquipmentEntry[],
  laborCost?: number
): number {
  return equipmentEntries.reduce((total, entry) => {
    // Check if this is "Minor Tools" entry
    const isMinorTools = entry.nameAndCapacity.toLowerCase().includes('minor tools');
    
    if (isMinorTools && laborCost !== undefined) {
      // Minor Tools = 10% of Labor Cost (as per screenshot)
      return total + (laborCost * 0.10);
    } else {
      // Standard equipment calculation
      const amount = entry.noOfUnits * entry.noOfHours * entry.hourlyRate;
      return total + amount;
    }
  }, 0);
}

// =============================================
// MATERIAL COST COMPUTATION
// =============================================

/**
 * Compute total material cost from material entries
 * Formula: Σ(quantity × unitCost)
 */
export function computeMaterialCost(materialEntries: IMaterialEntry[]): number {
  return materialEntries.reduce((total, entry) => {
    const amount = entry.quantity * entry.unitCost;
    return total + amount;
  }, 0);
}

// =============================================
// ADD-ONS COMPUTATION
// =============================================

/**
 * Compute add-ons based on direct cost and percentages
 * 
 * Formula from UPA screenshot (verified against actual values):
 * - Direct Unit Cost = Labor + Equipment + Material
 * - OCM (Overhead, Contingencies & Misc) = Direct Cost × OCM%
 * - CP (Contractor's Profit) = Direct Cost × CP%  [Note: Also on Direct Cost, not cumulative]
 * - Subtotal = Direct Cost + OCM + CP
 * - VAT (Value Added Tax) = Subtotal × VAT%
 * - Total Unit Cost = Subtotal + VAT
 * 
 * Note: Based on screenshot values, both OCM and CP are calculated on the original
 * direct cost, not sequentially. VAT is then applied to the subtotal.
 */
export interface AddOnResult {
  ocm: number;
  cp: number;
  vat: number;
  total: number;
}

export function computeAddOns(
  directCost: number,
  ocmPercent: number,
  cpPercent: number,
  vatPercent: number
): AddOnResult {
  // Step 1: Apply OCM to direct cost
  const ocm = directCost * (ocmPercent / 100);
  
  // Step 2: Apply CP to direct cost (not to subtotal!)
  const cp = directCost * (cpPercent / 100);
  
  // Step 3: Calculate subtotal
  const subtotal = directCost + ocm + cp;
  
  // Step 4: Apply VAT to subtotal
  const vat = subtotal * (vatPercent / 100);
  const total = subtotal + vat;
  
  return { ocm, cp, vat, total };
}

// =============================================
// MAIN PRICING ENGINE
// =============================================

/**
 * Compute complete pricing breakdown for a rate item
 * Returns both Submitted and Evaluated costs
 */
export function computeRateItemCosts(rateItem: IRateItem): CostBreakdown {
  // ========== SUBMITTED COSTS ==========
  
  // Labor - Submitted
  const laborSubmitted = computeLaborCost(rateItem.laborSubmitted);
  
  // Equipment - Submitted (include labor cost for minor tools calculation)
  const equipmentSubmitted = computeEquipmentCost(
    rateItem.equipmentSubmitted,
    laborSubmitted
  );
  
  // Material - Submitted
  const materialSubmitted = computeMaterialCost(rateItem.materialSubmitted);
  
  // Direct Cost - Submitted
  const directCostSubmitted = laborSubmitted + equipmentSubmitted + materialSubmitted;
  
  // Add-ons - Submitted
  const addOnsSubmitted = computeAddOns(
    directCostSubmitted,
    rateItem.addOnPercentages.ocmSubmitted,
    rateItem.addOnPercentages.cpSubmitted,
    rateItem.addOnPercentages.vatSubmitted
  );
  
  // ========== EVALUATED COSTS ==========
  
  // Labor - Evaluated
  const laborEvaluated = computeLaborCost(rateItem.laborEvaluated);
  
  // Equipment - Evaluated
  const equipmentEvaluated = computeEquipmentCost(
    rateItem.equipmentEvaluated,
    laborEvaluated
  );
  
  // Material - Evaluated
  const materialEvaluated = computeMaterialCost(rateItem.materialEvaluated);
  
  // Direct Cost - Evaluated
  const directCostEvaluated = laborEvaluated + equipmentEvaluated + materialEvaluated;
  
  // Add-ons - Evaluated
  const addOnsEvaluated = computeAddOns(
    directCostEvaluated,
    rateItem.addOnPercentages.ocmEvaluated,
    rateItem.addOnPercentages.cpEvaluated,
    rateItem.addOnPercentages.vatEvaluated
  );
  
  // ========== RETURN COMPLETE BREAKDOWN ==========
  
  return {
    laborSubmitted,
    laborEvaluated,
    equipmentSubmitted,
    equipmentEvaluated,
    materialSubmitted,
    materialEvaluated,
    directCostSubmitted,
    directCostEvaluated,
    ocmSubmitted: addOnsSubmitted.ocm,
    ocmEvaluated: addOnsEvaluated.ocm,
    cpSubmitted: addOnsSubmitted.cp,
    cpEvaluated: addOnsEvaluated.cp,
    vatSubmitted: addOnsSubmitted.vat,
    vatEvaluated: addOnsEvaluated.vat,
    totalSubmitted: addOnsSubmitted.total,
    totalEvaluated: addOnsEvaluated.total
  };
}

/**
 * Compute line item estimate for BOQ
 * @param rateItem - The rate item (UPA) to use for pricing
 * @param quantity - Quantity from BOQ
 * @param useEvaluated - Use evaluated costs instead of submitted (default: false)
 */
export function computeLineItemEstimate(
  rateItem: IRateItem,
  quantity: number,
  useEvaluated: boolean = false
): LineItemEstimate {
  const breakdown = computeRateItemCosts(rateItem);
  
  // Select which unit rate to use
  const unitRate = useEvaluated ? breakdown.totalEvaluated : breakdown.totalSubmitted;
  
  // Calculate total amount
  const totalAmount = quantity * unitRate;
  
  return {
    quantity,
    unitRate,
    totalAmount,
    breakdown
  };
}

/**
 * Helper function to format currency (Philippine Peso)
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Helper function to round to 2 decimal places
 */
export function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}
