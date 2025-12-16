'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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

interface MaterialEntry {
  nameAndSpecification: string;
  unit: string;
  quantity: number;
  unitCost: number;
}

export default function EditRateItemPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Header fields
  const [payItemNumber, setPayItemNumber] = useState('');
  const [payItemDescription, setPayItemDescription] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [outputPerHour, setOutputPerHour] = useState(1.0);

  // Labor - Submitted
  const [laborSubmitted, setLaborSubmitted] = useState<LaborEntry[]>([]);

  // Equipment - Submitted
  const [equipmentSubmitted, setEquipmentSubmitted] = useState<EquipmentEntry[]>([]);

  // Material - Submitted
  const [materialSubmitted, setMaterialSubmitted] = useState<MaterialEntry[]>([]);

  // Add-on percentages
  const [ocmSubmitted, setOcmSubmitted] = useState(0);
  const [ocmEvaluated, setOcmEvaluated] = useState(15);
  const [cpSubmitted, setCpSubmitted] = useState(10);
  const [cpEvaluated, setCpEvaluated] = useState(0);
  const [vatSubmitted, setVatSubmitted] = useState(12);
  const [vatEvaluated, setVatEvaluated] = useState(0);

  useEffect(() => {
    fetchRateItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchRateItem = async () => {
    try {
      const response = await fetch(`/api/rates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const item = data.data;
        setPayItemNumber(item.payItemNumber);
        setPayItemDescription(item.payItemDescription);
        setUnitOfMeasurement(item.unitOfMeasurement);
        setOutputPerHour(item.outputPerHourSubmitted);
        setLaborSubmitted(item.laborSubmitted.map((l: any) => ({
          designation: l.designation,
          noOfPersons: l.noOfPersons,
          noOfHours: l.noOfHours,
          hourlyRate: l.hourlyRate
        })));
        setEquipmentSubmitted(item.equipmentSubmitted.map((e: any) => ({
          nameAndCapacity: e.nameAndCapacity,
          noOfUnits: e.noOfUnits,
          noOfHours: e.noOfHours,
          hourlyRate: e.hourlyRate
        })));
        setMaterialSubmitted(item.materialSubmitted.map((m: any) => ({
          nameAndSpecification: m.nameAndSpecification,
          unit: m.unit,
          quantity: m.quantity,
          unitCost: m.unitCost
        })));
        setOcmSubmitted(item.addOnPercentages.ocmSubmitted);
        setOcmEvaluated(item.addOnPercentages.ocmEvaluated);
        setCpSubmitted(item.addOnPercentages.cpSubmitted);
        setCpEvaluated(item.addOnPercentages.cpEvaluated);
        setVatSubmitted(item.addOnPercentages.vatSubmitted);
        setVatEvaluated(item.addOnPercentages.vatEvaluated);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rates/${params.id}`, {
        method: 'PUT',
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

  if (loadingData) {
    return <div className="text-center py-8">Loading rate item...</div>;
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Rate Item (UPA)</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Header Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pay Item Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pay Item Number *</label>
              <input
                type="text"
                value={payItemNumber}
                onChange={(e) => setPayItemNumber(e.target.value)}
                required
                placeholder="e.g., 801 (1)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit of Measurement *</label>
              <input
                type="text"
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                required
                placeholder="e.g., l.s., cu.m"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Pay Item Description *</label>
              <textarea
                value={payItemDescription}
                onChange={(e) => setPayItemDescription(e.target.value)}
                required
                rows={2}
                placeholder="e.g., Removal of Structures and Obstruction"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Output per Hour</label>
              <input
                type="number"
                step="0.01"
                value={outputPerHour}
                onChange={(e) => setOutputPerHour(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Labor Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">A-1: LABOR - As Submitted</h2>
            <button type="button" onClick={addLaborRow} className="success text-sm">
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
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                  <td className="text-right font-mono font-semibold">
                    ₱{laborSubmitted.reduce((sum, l) => sum + (l.noOfPersons * l.noOfHours * l.hourlyRate), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">B-1: EQUIPMENT - As Submitted</h2>
            <button type="button" onClick={addEquipmentRow} className="success text-sm">
              + Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
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
                <tr>
                  <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                  <td className="text-right font-mono font-semibold">
                    ₱{equipmentSubmitted.reduce((sum, e) => sum + (e.noOfUnits * e.noOfHours * e.hourlyRate), 0).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Material Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">F-1: MATERIAL - As Submitted</h2>
            <button type="button" onClick={addMaterialRow} className="success text-sm">
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
                  <tr>
                    <td colSpan={4} className="text-right font-semibold">Subtotal:</td>
                    <td className="text-right font-mono font-semibold">
                      ₱{materialSubmitted.reduce((sum, m) => sum + (m.quantity * m.unitCost), 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Add-on Percentages */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add-on Percentages</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">OCM - Submitted (%)</label>
              <input
                type="number"
                step="0.01"
                value={ocmSubmitted}
                onChange={(e) => setOcmSubmitted(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">OCM - Evaluated (%)</label>
              <input
                type="number"
                step="0.01"
                value={ocmEvaluated}
                onChange={(e) => setOcmEvaluated(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CP - Submitted (%)</label>
              <input
                type="number"
                step="0.01"
                value={cpSubmitted}
                onChange={(e) => setCpSubmitted(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CP - Evaluated (%)</label>
              <input
                type="number"
                step="0.01"
                value={cpEvaluated}
                onChange={(e) => setCpEvaluated(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VAT - Submitted (%)</label>
              <input
                type="number"
                step="0.01"
                value={vatSubmitted}
                onChange={(e) => setVatSubmitted(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VAT - Evaluated (%)</label>
              <input
                type="number"
                step="0.01"
                value={vatEvaluated}
                onChange={(e) => setVatEvaluated(parseFloat(e.target.value) || 0)}
              />
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
            {loading ? 'Saving...' : 'Update Rate Item'}
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
