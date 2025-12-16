'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LaborEntry {
  designation: string;
  noOfPersons: number;
  noOfHours: number;
  hourlyRate: number;
}

interface EquipmentEntry {
  nameAndCapacity: string;
  noOfUnits: number;
  noOfHours: number;
  hourlyRate: number;
}

interface EquipmentItem {
  _id: string;
  no: number;
  completeDescription: string;
  description: string;
  model?: string;
  capacity?: string;
  flywheelHorsepower?: number;
  hourlyRate: number;
}

interface MaterialEntry {
  nameAndSpecification: string;
  unit: string;
  quantity: number;
  unitCost: number;
}

export default function NewRateItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Header fields
  const [payItemNumber, setPayItemNumber] = useState('');
  const [payItemDescription, setPayItemDescription] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [outputPerHour, setOutputPerHour] = useState(1.0);

  // Labor - Submitted
  const [laborSubmitted, setLaborSubmitted] = useState<LaborEntry[]>([
    { designation: 'Foreman', noOfPersons: 1, noOfHours: 0, hourlyRate: 220.85 },
    { designation: 'Unskilled Labor', noOfPersons: 0, noOfHours: 0, hourlyRate: 72.85 }
  ]);

  // Equipment - Submitted
  const [equipmentSubmitted, setEquipmentSubmitted] = useState<EquipmentEntry[]>([
    { nameAndCapacity: 'Minor Tools (10% of Labor Cost)', noOfUnits: 1, noOfHours: 0, hourlyRate: 0 }
  ]);

  // Material - Submitted
  const [materialSubmitted, setMaterialSubmitted] = useState<MaterialEntry[]>([]);

  // Add-on percentages
  const [ocmSubmitted, setOcmSubmitted] = useState(0);
  const [ocmEvaluated, setOcmEvaluated] = useState(15);
  const [cpSubmitted, setCpSubmitted] = useState(10);
  const [cpEvaluated, setCpEvaluated] = useState(0);
  const [vatSubmitted, setVatSubmitted] = useState(12);
  const [vatEvaluated, setVatEvaluated] = useState(0);

  // Equipment database
  const [equipmentDatabase, setEquipmentDatabase] = useState<EquipmentItem[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  useEffect(() => {
    fetchEquipmentDatabase();
  }, []);

  const fetchEquipmentDatabase = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();
      if (data.success) {
        setEquipmentDatabase(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payItemNumber,
          payItemDescription,
          unitOfMeasurement,
          outputPerHourSubmitted: outputPerHour,
          outputPerHourEvaluated: outputPerHour,
          laborSubmitted: laborSubmitted.map(l => ({
            ...l,
            amount: l.noOfPersons * l.noOfHours * l.hourlyRate
          })),
          laborEvaluated: [],
          equipmentSubmitted: equipmentSubmitted.map(e => ({
            ...e,
            amount: e.noOfUnits * e.noOfHours * e.hourlyRate
          })),
          equipmentEvaluated: [],
          materialSubmitted: materialSubmitted.map(m => ({
            ...m,
            amount: m.quantity * m.unitCost
          })),
          materialEvaluated: [],
          addOnPercentages: {
            ocmSubmitted,
            ocmEvaluated,
            cpSubmitted,
            cpEvaluated,
            vatSubmitted,
            vatEvaluated
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/rates');
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLaborRow = () => {
    setLaborSubmitted([...laborSubmitted, { designation: '', noOfPersons: 0, noOfHours: 0, hourlyRate: 0 }]);
  };

  const removeLaborRow = (index: number) => {
    setLaborSubmitted(laborSubmitted.filter((_, i) => i !== index));
  };

  const updateLaborRow = (index: number, field: keyof LaborEntry, value: any) => {
    const updated = [...laborSubmitted];
    updated[index] = { ...updated[index], [field]: value };
    setLaborSubmitted(updated);
  };

  const addEquipmentRow = () => {
    setEquipmentSubmitted([...equipmentSubmitted, { nameAndCapacity: '', noOfUnits: 0, noOfHours: 0, hourlyRate: 0 }]);
  };

  const removeEquipmentRow = (index: number) => {
    setEquipmentSubmitted(equipmentSubmitted.filter((_, i) => i !== index));
  };

  const updateEquipmentRow = (index: number, field: keyof EquipmentEntry, value: any) => {
    const updated = [...equipmentSubmitted];
    updated[index] = { ...updated[index], [field]: value };
    setEquipmentSubmitted(updated);
  };

  const handleEquipmentSelect = (index: number, equipmentId: string) => {
    const selected = equipmentDatabase.find(eq => eq._id === equipmentId);
    if (selected) {
      const updated = [...equipmentSubmitted];
      updated[index] = {
        ...updated[index],
        nameAndCapacity: selected.completeDescription,
        hourlyRate: selected.hourlyRate
      };
      setEquipmentSubmitted(updated);
    }
  };

  const addMaterialRow = () => {
    setMaterialSubmitted([...materialSubmitted, { nameAndSpecification: '', unit: '', quantity: 0, unitCost: 0 }]);
  };

  const removeMaterialRow = (index: number) => {
    setMaterialSubmitted(materialSubmitted.filter((_, i) => i !== index));
  };

  const updateMaterialRow = (index: number, field: keyof MaterialEntry, value: any) => {
    const updated = [...materialSubmitted];
    updated[index] = { ...updated[index], [field]: value };
    setMaterialSubmitted(updated);
  };

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Rate Item (UPA)</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* DPWH Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-blue-900">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600">Republic of the Philippines</div>
            <div className="font-bold text-lg">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
            <div className="font-bold text-xl mt-2">DETAILED UNIT PRICE ANALYSIS</div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-sm mb-4">
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Implementing Office:</label>
              <input type="text" className="col-span-3 border-b border-gray-400 bg-transparent" placeholder="DPWH Bukidnon 1st District Engineering Office" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Address:</label>
              <input type="text" className="col-span-3 border-b border-gray-400 bg-transparent" placeholder="San Mateo St., Malaybalay City, Bukidnon" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Project Name:</label>
              <input type="text" className="col-span-3 border-b border-gray-400 bg-transparent" placeholder="Construction (Completion) of Multi-Purpose Building, Purok 1, Barangay Violeta, City of Malaybalay, Bukidnon" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Project Location:</label>
              <input type="text" className="col-span-3 border-b border-gray-400 bg-transparent" placeholder="Brgy. Violeta, Malaybalay City, Bukidnon" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-300 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Pay Item Number: *</label>
              <input
                type="text"
                value={payItemNumber}
                onChange={(e) => setPayItemNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., 801 (1)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Unit of Measurement: *</label>
              <input
                type="text"
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., l.s."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Pay Item Description: *</label>
              <textarea
                value={payItemDescription}
                onChange={(e) => setPayItemDescription(e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., Removal of Structures and Obstruction"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Output per hour - As Submitted:</label>
              <input
                type="number"
                step="0.01"
                value={outputPerHour}
                onChange={(e) => setOutputPerHour(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Output per hour - As Evaluated:</label>
              <input
                type="number"
                step="0.01"
                value={outputPerHour}
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Labor Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4 flex justify-between items-center">
            <h2 className="font-bold">LABOR</h2>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">A-1: LABOR - As Submitted</h3>
            <button type="button" onClick={addLaborRow} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-1/3">Designation</th>
                  <th>No. of Persons</th>
                  <th>No. of Hours</th>
                  <th>Hourly Rate (₱)</th>
                  <th>Amount (₱)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {laborSubmitted.map((labor, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={labor.designation}
                        onChange={(e) => updateLaborRow(index, 'designation', e.target.value)}
                        placeholder="e.g., Foreman"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={labor.noOfPersons}
                        onChange={(e) => updateLaborRow(index, 'noOfPersons', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={labor.noOfHours}
                        onChange={(e) => updateLaborRow(index, 'noOfHours', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={labor.hourlyRate}
                        onChange={(e) => updateLaborRow(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="text-right font-mono">
                      {(labor.noOfPersons * labor.noOfHours * labor.hourlyRate).toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeLaborRow(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={4} className="text-right px-4 py-2">Sub - Total for A - 1 - As Submitted</td>
                  <td className="text-right font-mono px-4 py-2">
                    ₱{laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* A-2: LABOR - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <h2 className="font-bold">LABOR</h2>
          </div>
          <h3 className="font-semibold text-lg mb-4">A-2: LABOR - As Evaluated</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-gray-600 text-sm text-center">No evaluated data. Use "As Submitted" values for calculation.</p>
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="flex justify-between font-semibold">
              <span>Sub - Total for A - 2 - As Evaluated</span>
              <span className="font-mono">₱0.00</span>
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <h2 className="font-bold">EQUIPMENT</h2>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">B-1: EQUIPMENT - As Submitted</h3>
            <button type="button" onClick={addEquipmentRow} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-16">Select</th>
                  <th className="w-1/3">Name and Capacity</th>
                  <th>No. of Units</th>
                  <th>No. of Hours</th>
                  <th>Hourly Rate (₱)</th>
                  <th>Amount (₱)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {equipmentSubmitted.map((equip, index) => (
                  <tr key={index}>
                    <td className="px-2">
                      <select
                        onChange={(e) => handleEquipmentSelect(index, e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-yellow-50"
                        title="Select from equipment database"
                      >
                        <option value="">-- DB --</option>
                        {equipmentDatabase.map((eq) => (
                          <option key={eq._id} value={eq._id}>
                            {eq.no}. {eq.description}
                          </option>
                        ))}
                      </select>
                      {loadingEquipment && (
                        <div className="text-xs text-gray-500">...</div>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={equip.nameAndCapacity}
                        onChange={(e) => updateEquipmentRow(index, 'nameAndCapacity', e.target.value)}
                        placeholder="e.g., Minor Tools (10% of Labor Cost)"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={equip.noOfUnits}
                        onChange={(e) => updateEquipmentRow(index, 'noOfUnits', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={equip.noOfHours}
                        onChange={(e) => updateEquipmentRow(index, 'noOfHours', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={equip.hourlyRate}
                        onChange={(e) => updateEquipmentRow(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="text-right font-mono">
                      {(equip.noOfUnits * equip.noOfHours * equip.hourlyRate).toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeEquipmentRow(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={4} className="text-right px-4 py-2">Sub - Total for B - 1 - As Submitted</td>
                  <td className="text-right font-mono px-4 py-2">
                    ₱{equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* B-2: EQUIPMENT - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <h2 className="font-bold">EQUIPMENT</h2>
          </div>
          <h3 className="font-semibold text-lg mb-4">B-2: EQUIPMENT - As Evaluated</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-gray-600 text-sm text-center">No evaluated data. Use "As Submitted" values for calculation.</p>
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="flex justify-between font-semibold">
              <span>Sub - Total for B - 2 - As Evaluated</span>
              <span className="font-mono">₱0.00</span>
            </div>
          </div>
        </div>

        {/* C-1: Total Labor + Equipment - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-blue-900 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">C-1: Total (A + B) - As Submitted</span>
              <span className="font-mono font-bold">
                ₱{(laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                   equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* C-2: Total Labor + Equipment - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-blue-900 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">C-2: Total (A + B) - As Evaluated</span>
              <span className="font-mono font-bold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* D-1: Output per hour - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">D-1: Output per hour - As Submitted</span>
              <span className="font-mono">{outputPerHour.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* D-2: Output per hour - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">D-2: Output per hour - As Evaluated</span>
              <span className="font-mono">{outputPerHour.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* E-1: Direct Unit Cost - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-blue-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">E-1: Direct Unit Cost (C ÷ D) - As Submitted</span>
              <span className="font-mono font-bold">
                ₱{((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                    equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                    (outputPerHour || 1)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* E-2: Direct Unit Cost - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-blue-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">E-2: Direct Unit Cost (C ÷ D) - As Evaluated</span>
              <span className="font-mono font-bold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* Material Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <h2 className="font-bold">MATERIAL</h2>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">F-1: MATERIAL - As Submitted</h3>
            <button type="button" onClick={addMaterialRow} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-1/3">Name and Specification</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Unit Cost (₱)</th>
                  <th>Amount (₱)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {materialSubmitted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-4">
                      No materials added. Click "+ Add Row" to add materials.
                    </td>
                  </tr>
                ) : (
                  materialSubmitted.map((material, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={material.nameAndSpecification}
                          onChange={(e) => updateMaterialRow(index, 'nameAndSpecification', e.target.value)}
                          placeholder="e.g., Portland Cement, Type I"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={material.unit}
                          onChange={(e) => updateMaterialRow(index, 'unit', e.target.value)}
                          placeholder="e.g., bag"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={material.quantity}
                          onChange={(e) => updateMaterialRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={material.unitCost}
                          onChange={(e) => updateMaterialRow(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="text-right font-mono">
                        {(material.quantity * material.unitCost).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeMaterialRow(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {materialSubmitted.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={4} className="text-right px-4 py-2">Sub - Total for F - 1 - As Submitted</td>
                    <td className="text-right font-mono px-4 py-2">
                      ₱{materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* F-2: MATERIAL - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-800 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <h2 className="font-bold">MATERIAL</h2>
          </div>
          <h3 className="font-semibold text-lg mb-4">F-2: MATERIAL - As Evaluated</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <p className="text-gray-600 text-sm text-center">No evaluated data. Use "As Submitted" values for calculation.</p>
          </div>
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <div className="flex justify-between font-semibold">
              <span>Sub - Total for F - 2 - As Evaluated</span>
              <span className="font-mono">₱0.00</span>
            </div>
          </div>
        </div>

        {/* G-1: Direct Unit Cost (E + F) - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-blue-700 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">G-1: Direct Unit Cost (E + F) - As Submitted</span>
              <span className="font-mono font-bold">
                ₱{(((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                     equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                     (outputPerHour || 1)) +
                   materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* G-2: Direct Unit Cost (E + F) - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-blue-700 text-white px-4 py-2 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">G-2: Direct Unit Cost (E + F) - As Evaluated</span>
              <span className="font-mono font-bold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* H-1: OCM - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">H-1: Overhead, Contingencies & Miscellaneous (OCM) Expenses - As Submitted</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={ocmSubmitted}
                    onChange={(e) => setOcmSubmitted(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">
                ₱{(((((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                       equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                       (outputPerHour || 1)) +
                     materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)) * ocmSubmitted / 100)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* H-2: OCM - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">H-2: Overhead, Contingencies & Miscellaneous (OCM) Expenses - As Evaluated</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={ocmEvaluated}
                    onChange={(e) => setOcmEvaluated(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* I-1: Contractor's Profit - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">I-1: Contractor's Profit (CP) - As Submitted</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={cpSubmitted}
                    onChange={(e) => setCpSubmitted(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">
                ₱{(((((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                       equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                       (outputPerHour || 1)) +
                     materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)) * cpSubmitted / 100)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* I-2: Contractor's Profit - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">I-2: Contractor's Profit (CP) - As Evaluated</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={cpEvaluated}
                    onChange={(e) => setCpEvaluated(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* J-1: VAT - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">J-1: Value Added Tax (VAT) - As Submitted</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={vatSubmitted}
                    onChange={(e) => setVatSubmitted(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">
                ₱{((((((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                        equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                        (outputPerHour || 1)) +
                      materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)) * 
                     (1 + ocmSubmitted/100 + cpSubmitted/100)) * vatSubmitted / 100)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* J-2: VAT - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-100 px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="font-semibold">J-2: Value Added Tax (VAT) - As Evaluated</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={vatEvaluated}
                    onChange={(e) => setVatEvaluated(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                  />
                  <span>%</span>
                </div>
              </div>
              <span className="font-mono font-semibold">₱0.00</span>
            </div>
          </div>
        </div>

        {/* TOTAL COST - As Submitted */}
        <div className="bg-white rounded-lg shadow p-6 mb-2 border-4 border-green-600">
          <div className="bg-green-600 text-white px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL COST - As Submitted</span>
              <span className="font-mono font-bold text-xl">
                ₱{((((((laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0) +
                         equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0)) / 
                         (outputPerHour || 1)) +
                       materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0)) * 
                      (1 + ocmSubmitted/100 + cpSubmitted/100)) * (1 + vatSubmitted/100))).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* TOTAL COST - As Evaluated */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-4 border-blue-600">
          <div className="bg-blue-600 text-white px-4 py-3 -mx-6 -mt-6 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL COST - As Evaluated</span>
              <span className="font-mono font-bold text-xl">₱0.00</span>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="primary"
          >
            {loading ? 'Saving...' : 'Save Rate Item'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/rates')}
            className="secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
