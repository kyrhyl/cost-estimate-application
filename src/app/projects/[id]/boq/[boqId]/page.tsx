'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ComputedLabor {
  designation: string;
  noOfPersons: number;
  noOfHours: number;
  hourlyRate: number;
  amount: number;
}

interface ComputedEquipment {
  equipmentId: string;
  description: string;
  noOfUnits: number;
  noOfHours: number;
  hourlyRate: number;
  amount: number;
}

interface ComputedMaterial {
  materialCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitCost: number;
  amount: number;
  haulingIncluded?: boolean;
  basePrice?: number;
  haulingCost?: number;
}

interface BOQItem {
  _id: string;
  projectId: any;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  outputPerHour: number;
  category?: string;
  specification?: string;
  quantity: number;
  laborItems: ComputedLabor[];
  equipmentItems: ComputedEquipment[];
  materialItems: ComputedMaterial[];
  directCost: number;
  ocmPercentage: number;
  ocmCost: number;
  cpPercentage: number;
  cpCost: number;
  subtotalWithMarkup: number;
  vatPercentage: number;
  vatCost: number;
  totalCost: number;
  unitCost: number;
  totalAmount: number;
  location: string;
  instantiatedAt: string;
}

export default function BOQDetailPage({ 
  params 
}: { 
  params: { id: string; boqId: string } 
}) {
  const router = useRouter();
  const [boqItem, setBoqItem] = useState<BOQItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBOQItem();
  }, [params.boqId]);

  const fetchBOQItem = async () => {
    try {
      const response = await fetch(`/api/project-boq/${params.boqId}`);
      const result = await response.json();
      if (result.success) {
        setBoqItem(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch BOQ item:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading DUPA details...</div>
      </div>
    );
  }

  if (!boqItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">BOQ item not found</div>
      </div>
    );
  }

  const projectName = boqItem.projectId?.projectName || 'Project';

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/projects/${params.id}`)}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          ← Back to Project
        </button>
        <h1 className="text-3xl font-bold mb-2">Detailed Unit Price Analysis (DUPA)</h1>
        <p className="text-gray-600">{projectName}</p>
      </div>

      {/* Pay Item Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pay Item Number</h3>
            <p className="text-lg font-semibold">{boqItem.payItemNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="text-lg">{boqItem.category || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="text-lg">{boqItem.payItemDescription}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Unit of Measurement</h3>
            <p className="text-lg">{boqItem.unitOfMeasurement}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Output per Hour</h3>
            <p className="text-lg">{boqItem.outputPerHour}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location (Rates Applied)</h3>
            <p className="text-lg font-medium text-blue-600">{boqItem.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Instantiated At</h3>
            <p className="text-lg">{new Date(boqItem.instantiatedAt).toLocaleString()}</p>
          </div>
          {boqItem.specification && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Specification</h3>
              <p className="text-lg">{boqItem.specification}</p>
            </div>
          )}
        </div>
      </div>

      {/* Labor Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">A. LABOR</h2>
        {boqItem.laborItems.length === 0 ? (
          <p className="text-gray-500">No labor items</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    No. of Persons
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    No. of Hours
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Hourly Rate
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boqItem.laborItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.designation}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.noOfPersons.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.noOfHours.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      ₱{item.hourlyRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-sm text-right">
                    Total Labor:
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    ₱{boqItem.laborItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">B. EQUIPMENT</h2>
        {boqItem.equipmentItems.length === 0 ? (
          <p className="text-gray-500">No equipment items</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    No. of Units
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    No. of Hours
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Hourly Rate
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boqItem.equipmentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.noOfUnits.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.noOfHours.toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      ₱{item.hourlyRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-sm text-right">
                    Total Equipment:
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    ₱{boqItem.equipmentItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Materials Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">C. MATERIALS</h2>
        {boqItem.materialItems.length === 0 ? (
          <p className="text-gray-500">No material items</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Material Code
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Unit
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Base Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Hauling
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Unit Cost
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boqItem.materialItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{item.materialCode}</td>
                    <td className="px-4 py-2 text-sm">{item.description}</td>
                    <td className="px-4 py-2 text-sm">{item.unit}</td>
                    <td className="px-4 py-2 text-sm text-right">{item.quantity.toFixed(3)}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      ₱{(item.basePrice || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {item.haulingIncluded ? (
                        <span className="text-blue-600">
                          +₱{(item.haulingCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      ₱{item.unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium">
                      ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={7} className="px-4 py-2 text-sm text-right">
                    Total Materials:
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    ₱{boqItem.materialItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">COST SUMMARY</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Direct Cost (Labor + Equipment + Materials):</span>
            <span className="font-semibold">
              ₱{boqItem.directCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Overhead, Contingencies & Miscellaneous ({boqItem.ocmPercentage}%):</span>
            <span>₱{boqItem.ocmCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Contractor's Profit ({boqItem.cpPercentage}%):</span>
            <span>₱{boqItem.cpCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Subtotal with Markup:</span>
            <span className="font-semibold">
              ₱{boqItem.subtotalWithMarkup.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>VAT ({boqItem.vatPercentage}%):</span>
            <span>₱{boqItem.vatCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-3 bg-blue-50 px-4 rounded font-bold text-lg">
            <span>TOTAL COST (per {boqItem.unitOfMeasurement}):</span>
            <span className="text-blue-700">
              ₱{boqItem.totalCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-2 bg-gray-100 px-4 rounded">
            <span className="font-medium">Unit Cost (per unit output):</span>
            <span className="font-semibold">
              ₱{boqItem.unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Project Quantity */}
      <div className="bg-green-50 shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">PROJECT BOQ</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="font-medium">Quantity Required:</span>
            <span className="font-semibold">{boqItem.quantity.toFixed(2)} {boqItem.unitOfMeasurement}</span>
          </div>
          <div className="flex justify-between py-3 bg-green-100 px-4 rounded font-bold text-xl">
            <span>TOTAL PROJECT AMOUNT:</span>
            <span className="text-green-700">
              ₱{boqItem.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
