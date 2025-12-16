'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/pricing-engine';

interface LaborEntry {
  designation: string;
  noOfPersons: number;
  noOfHours: number;
  hourlyRate: number;
  amount: number;
}

interface EquipmentEntry {
  nameAndCapacity: string;
  noOfUnits: number;
  noOfHours: number;
  hourlyRate: number;
  amount: number;
}

interface MaterialEntry {
  nameAndSpecification: string;
  unit: string;
  quantity: number;
  unitCost: number;
  amount: number;
}

interface RateItem {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  outputPerHourSubmitted: number;
  outputPerHourEvaluated: number;
  laborSubmitted: LaborEntry[];
  laborEvaluated: LaborEntry[];
  equipmentSubmitted: EquipmentEntry[];
  equipmentEvaluated: EquipmentEntry[];
  materialSubmitted: MaterialEntry[];
  materialEvaluated: MaterialEntry[];
  addOnPercentages: {
    ocmSubmitted: number;
    ocmEvaluated: number;
    cpSubmitted: number;
    cpEvaluated: number;
    vatSubmitted: number;
    vatEvaluated: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ViewRateItemPage() {
  const params = useParams();
  const router = useRouter();
  const [rateItem, setRateItem] = useState<RateItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRateItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchRateItem = async () => {
    try {
      const response = await fetch(`/api/rates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setRateItem(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading rate item...</div>;
  }

  if (error || !rateItem) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded my-8">
        {error || 'Rate item not found'}
      </div>
    );
  }

  const laborTotal = rateItem.laborSubmitted.reduce((sum, l) => sum + l.amount, 0);
  const equipmentTotal = rateItem.equipmentSubmitted.reduce((sum, e) => sum + e.amount, 0);
  const materialTotal = rateItem.materialSubmitted.reduce((sum, m) => sum + m.amount, 0);
  const directCost = laborTotal + equipmentTotal + materialTotal;

  return (
    <div className="py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {rateItem.payItemNumber}: {rateItem.payItemDescription}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Unit:</span> {rateItem.unitOfMeasurement}</p>
              <p><span className="font-medium">Output per Hour (Submitted):</span> {rateItem.outputPerHourSubmitted}</p>
              <p><span className="font-medium">Created:</span> {new Date(rateItem.createdAt).toLocaleString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(rateItem.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/rates/${params.id}/edit`)}
              className="primary"
            >
              Edit
            </button>
            <button
              onClick={() => router.push('/rates')}
              className="secondary"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Labor Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          A-1: LABOR - As Submitted
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Designation</th>
                <th>No. of Persons</th>
                <th>No. of Hours</th>
                <th>Hourly Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rateItem.laborSubmitted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500">No labor entries</td>
                </tr>
              ) : (
                rateItem.laborSubmitted.map((labor, index) => (
                  <tr key={index}>
                    <td>{labor.designation}</td>
                    <td className="text-right">{labor.noOfPersons}</td>
                    <td className="text-right">{labor.noOfHours}</td>
                    <td className="text-right">{formatCurrency(labor.hourlyRate)}</td>
                    <td className="text-right font-semibold">{formatCurrency(labor.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rateItem.laborSubmitted.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                  <td className="text-right font-semibold">{formatCurrency(laborTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          B-1: EQUIPMENT - As Submitted
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name and Capacity</th>
                <th>No. of Units</th>
                <th>No. of Hours</th>
                <th>Hourly Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rateItem.equipmentSubmitted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500">No equipment entries</td>
                </tr>
              ) : (
                rateItem.equipmentSubmitted.map((equipment, index) => (
                  <tr key={index}>
                    <td>{equipment.nameAndCapacity}</td>
                    <td className="text-right">{equipment.noOfUnits}</td>
                    <td className="text-right">{equipment.noOfHours}</td>
                    <td className="text-right">{formatCurrency(equipment.hourlyRate)}</td>
                    <td className="text-right font-semibold">{formatCurrency(equipment.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rateItem.equipmentSubmitted.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                  <td className="text-right font-semibold">{formatCurrency(equipmentTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Material Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          F-1: MATERIAL - As Submitted
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Name and Specification</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rateItem.materialSubmitted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500">No material entries</td>
                </tr>
              ) : (
                rateItem.materialSubmitted.map((material, index) => (
                  <tr key={index}>
                    <td>{material.nameAndSpecification}</td>
                    <td className="text-center">{material.unit}</td>
                    <td className="text-right">{material.quantity}</td>
                    <td className="text-right">{formatCurrency(material.unitCost)}</td>
                    <td className="text-right font-semibold">{formatCurrency(material.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rateItem.materialSubmitted.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                  <td className="text-right font-semibold">{formatCurrency(materialTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          Cost Summary
        </div>
        <div className="p-6">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2">Labor Cost:</td>
                <td className="text-right font-mono">{formatCurrency(laborTotal)}</td>
              </tr>
              <tr>
                <td className="py-2">Equipment Cost:</td>
                <td className="text-right font-mono">{formatCurrency(equipmentTotal)}</td>
              </tr>
              <tr>
                <td className="py-2">Material Cost:</td>
                <td className="text-right font-mono">{formatCurrency(materialTotal)}</td>
              </tr>
              <tr className="border-t-2 border-gray-700">
                <td className="py-2 font-semibold">Direct Cost:</td>
                <td className="text-right font-mono font-semibold text-lg">{formatCurrency(directCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add-on Percentages */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          Add-on Percentages
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">As Submitted</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>OCM:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.ocmSubmitted}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Contractor's Profit:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.cpSubmitted}%</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.vatSubmitted}%</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">As Evaluated</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>OCM:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.ocmEvaluated}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Contractor's Profit:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.cpEvaluated}%</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span className="font-mono">{rateItem.addOnPercentages.vatEvaluated}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
