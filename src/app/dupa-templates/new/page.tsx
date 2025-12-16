'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LaborEntry {
  designation: string;
  noOfPersons: number;
  noOfHours: number;
}

interface EquipmentEntry {
  equipmentId: string;
  description: string;
  noOfUnits: number;
  noOfHours: number;
}

interface MaterialEntry {
  materialCode: string;
  description: string;
  unit: string;
  quantity: number;
}

export default function NewDUPATemplatePage() {
  const router = useRouter();

  // Basic info
  const [payItemNumber, setPayItemNumber] = useState('');
  const [payItemDescription, setPayItemDescription] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [outputPerHour, setOutputPerHour] = useState(1);
  const [category, setCategory] = useState('');
  const [specification, setSpecification] = useState('');
  const [notes, setNotes] = useState('');

  // Templates
  const [laborTemplate, setLaborTemplate] = useState<LaborEntry[]>([
    { designation: '', noOfPersons: 1, noOfHours: 8 },
  ]);
  const [equipmentTemplate, setEquipmentTemplate] = useState<EquipmentEntry[]>([]);
  const [materialTemplate, setMaterialTemplate] = useState<MaterialEntry[]>([]);

  // Add-ons
  const [ocmPercentage, setOcmPercentage] = useState(10);
  const [cpPercentage, setCpPercentage] = useState(8);
  const [vatPercentage, setVatPercentage] = useState(12);

  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Labor handlers
  const addLaborEntry = () => {
    setLaborTemplate([...laborTemplate, { designation: '', noOfPersons: 1, noOfHours: 8 }]);
  };

  const removeLaborEntry = (index: number) => {
    setLaborTemplate(laborTemplate.filter((_, i) => i !== index));
  };

  const updateLaborEntry = (index: number, field: keyof LaborEntry, value: string | number) => {
    const updated = [...laborTemplate];
    updated[index] = { ...updated[index], [field]: value };
    setLaborTemplate(updated);
  };

  // Equipment handlers
  const addEquipmentEntry = () => {
    setEquipmentTemplate([
      ...equipmentTemplate,
      { equipmentId: '', description: '', noOfUnits: 1, noOfHours: 8 },
    ]);
  };

  const removeEquipmentEntry = (index: number) => {
    setEquipmentTemplate(equipmentTemplate.filter((_, i) => i !== index));
  };

  const updateEquipmentEntry = (
    index: number,
    field: keyof EquipmentEntry,
    value: string | number
  ) => {
    const updated = [...equipmentTemplate];
    updated[index] = { ...updated[index], [field]: value };
    setEquipmentTemplate(updated);
  };

  // Material handlers
  const addMaterialEntry = () => {
    setMaterialTemplate([
      ...materialTemplate,
      { materialCode: '', description: '', unit: '', quantity: 1 },
    ]);
  };

  const removeMaterialEntry = (index: number) => {
    setMaterialTemplate(materialTemplate.filter((_, i) => i !== index));
  };

  const updateMaterialEntry = (
    index: number,
    field: keyof MaterialEntry,
    value: string | number
  ) => {
    const updated = [...materialTemplate];
    updated[index] = { ...updated[index], [field]: value };
    setMaterialTemplate(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!payItemNumber.trim()) {
      setError('Pay item number is required');
      setIsSubmitting(false);
      return;
    }
    if (!payItemDescription.trim()) {
      setError('Pay item description is required');
      setIsSubmitting(false);
      return;
    }
    if (!unitOfMeasurement.trim()) {
      setError('Unit of measurement is required');
      setIsSubmitting(false);
      return;
    }

    // Filter out empty entries
    const validLaborTemplate = laborTemplate.filter(
      (l) => l.designation.trim() && l.noOfPersons > 0 && l.noOfHours > 0
    );
    const validEquipmentTemplate = equipmentTemplate.filter(
      (e) => e.description.trim() && e.noOfUnits > 0 && e.noOfHours > 0
    );
    const validMaterialTemplate = materialTemplate.filter(
      (m) => m.description.trim() && m.quantity > 0 && m.unit.trim()
    );

    try {
      const response = await fetch('/api/dupa-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payItemNumber: payItemNumber.trim(),
          payItemDescription: payItemDescription.trim(),
          unitOfMeasurement: unitOfMeasurement.trim(),
          outputPerHour: Number(outputPerHour),
          category: category.trim(),
          specification: specification.trim(),
          notes: notes.trim(),
          laborTemplate: validLaborTemplate,
          equipmentTemplate: validEquipmentTemplate,
          materialTemplate: validMaterialTemplate,
          ocmPercentage: Number(ocmPercentage),
          cpPercentage: Number(cpPercentage),
          vatPercentage: Number(vatPercentage),
          isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dupa-templates/${data.data._id}`);
      } else {
        setError(data.error || 'Failed to create template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dupa-templates"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Templates
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create DUPA Template</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Item Number *
                </label>
                <input
                  type="text"
                  value={payItemNumber}
                  onChange={(e) => setPayItemNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 101(1)a"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement *
                </label>
                <input
                  type="text"
                  value={unitOfMeasurement}
                  onChange={(e) => setUnitOfMeasurement(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., cu.m., sq.m., l.m."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Item Description *
                </label>
                <input
                  type="text"
                  value={payItemDescription}
                  onChange={(e) => setPayItemDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter detailed description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output per Hour
                </label>
                <input
                  type="number"
                  value={outputPerHour}
                  onChange={(e) => setOutputPerHour(Number(e.target.value))}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Earthwork">Earthwork</option>
                  <option value="Concrete">Concrete</option>
                  <option value="Masonry">Masonry</option>
                  <option value="Reinforcement">Reinforcement</option>
                  <option value="Formwork">Formwork</option>
                  <option value="Structural Steel">Structural Steel</option>
                  <option value="Roofing">Roofing</option>
                  <option value="Painting">Painting</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specification
                </label>
                <textarea
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Technical specifications..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Labor Template */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Labor Template</h2>
              <button
                type="button"
                onClick={addLaborEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Labor
              </button>
            </div>

            {laborTemplate.length === 0 ? (
              <p className="text-gray-500">No labor entries. Click "Add Labor" to begin.</p>
            ) : (
              <div className="space-y-4">
                {laborTemplate.map((labor, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Designation
                        </label>
                        <select
                          value={labor.designation}
                          onChange={(e) =>
                            updateLaborEntry(index, 'designation', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select designation</option>
                          <option value="Foreman">Foreman</option>
                          <option value="Chief of Party">Chief of Party</option>
                          <option value="Skilled Labor">Skilled Labor</option>
                          <option value="Unskilled Labor">Unskilled Labor</option>
                          <option value="Mason">Mason</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Painter">Painter</option>
                          <option value="Welder">Welder</option>
                          <option value="Equipment Operator">Equipment Operator</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. of Persons
                        </label>
                        <input
                          type="number"
                          value={labor.noOfPersons}
                          onChange={(e) =>
                            updateLaborEntry(index, 'noOfPersons', Number(e.target.value))
                          }
                          min="1"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. of Hours
                        </label>
                        <input
                          type="number"
                          value={labor.noOfHours}
                          onChange={(e) =>
                            updateLaborEntry(index, 'noOfHours', Number(e.target.value))
                          }
                          min="0.1"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLaborEntry(index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Template */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Equipment Template</h2>
              <button
                type="button"
                onClick={addEquipmentEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Equipment
              </button>
            </div>

            {equipmentTemplate.length === 0 ? (
              <p className="text-gray-500">No equipment entries. Click "Add Equipment" to begin.</p>
            ) : (
              <div className="space-y-4">
                {equipmentTemplate.map((equip, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={equip.description}
                          onChange={(e) =>
                            updateEquipmentEntry(index, 'description', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Equipment description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. of Units
                        </label>
                        <input
                          type="number"
                          value={equip.noOfUnits}
                          onChange={(e) =>
                            updateEquipmentEntry(index, 'noOfUnits', Number(e.target.value))
                          }
                          min="0.1"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. of Hours
                        </label>
                        <input
                          type="number"
                          value={equip.noOfHours}
                          onChange={(e) =>
                            updateEquipmentEntry(index, 'noOfHours', Number(e.target.value))
                          }
                          min="0.1"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipment ID (optional)
                      </label>
                      <input
                        type="text"
                        value={equip.equipmentId}
                        onChange={(e) =>
                          updateEquipmentEntry(index, 'equipmentId', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Link to equipment database"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEquipmentEntry(index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Material Template */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Material Template</h2>
              <button
                type="button"
                onClick={addMaterialEntry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Material
              </button>
            </div>

            {materialTemplate.length === 0 ? (
              <p className="text-gray-500">No material entries. Click "Add Material" to begin.</p>
            ) : (
              <div className="space-y-4">
                {materialTemplate.map((material, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={material.description}
                          onChange={(e) =>
                            updateMaterialEntry(index, 'description', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Material description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={material.unit}
                          onChange={(e) => updateMaterialEntry(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., kg, bag, cu.m."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={material.quantity}
                          onChange={(e) =>
                            updateMaterialEntry(index, 'quantity', Number(e.target.value))
                          }
                          min="0.01"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material Code (optional)
                      </label>
                      <input
                        type="text"
                        value={material.materialCode}
                        onChange={(e) =>
                          updateMaterialEntry(index, 'materialCode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Link to material database"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterialEntry(index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add-on Percentages */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add-on Percentages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OCM (%)</label>
                <input
                  type="number"
                  value={ocmPercentage}
                  onChange={(e) => setOcmPercentage(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CP (%)</label>
                <input
                  type="number"
                  value={cpPercentage}
                  onChange={(e) => setCpPercentage(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VAT (%)</label>
                <input
                  type="number"
                  value={vatPercentage}
                  onChange={(e) => setVatPercentage(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dupa-templates"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
