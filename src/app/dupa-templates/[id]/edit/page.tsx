'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LaborTemplate {
  designation: string;
  noOfPersons: number;
  noOfHours: number;
}

interface EquipmentTemplate {
  equipmentId: string;
  description: string;
  noOfUnits: number;
  noOfHours: number;
}

interface MaterialTemplate {
  materialCode: string;
  description: string;
  unit: string;
  quantity: number;
}

interface Equipment {
  _id: string;
  no: string;
  description: string;
  completeDescription: string;
}

interface Material {
  _id: string;
  materialCode: string;
  materialDescription: string;
  unit: string;
  basePrice: number;
  category: string;
}

const LABOR_DESIGNATIONS = [
  'Foreman',
  'Leadman',
  'Equipment Operator - Heavy',
  'Equipment Operator - High Skilled',
  'Equipment Operator - Light Skilled',
  'Driver',
  'Skilled Labor',
  'Semi-Skilled Labor',
  'Unskilled Labor',
];

export default function EditDUPATemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Template Basic Info
  const [payItemNumber, setPayItemNumber] = useState('');
  const [payItemDescription, setPayItemDescription] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [outputPerHour, setOutputPerHour] = useState(1);
  const [category, setCategory] = useState('');
  const [specification, setSpecification] = useState('');
  const [notes, setNotes] = useState('');

  // Add-on percentages
  const [ocmPercentage, setOcmPercentage] = useState(15);
  const [cpPercentage, setCpPercentage] = useState(10);
  const [vatPercentage, setVatPercentage] = useState(12);

  // Template items
  const [laborItems, setLaborItems] = useState<LaborTemplate[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<EquipmentTemplate[]>([]);
  const [materialItems, setMaterialItems] = useState<MaterialTemplate[]>([]);

  useEffect(() => {
    fetchEquipment();
    fetchMaterials();
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/dupa-templates/${params.id}`);
      const result = await response.json();
      if (result.success) {
        const template = result.data;
        setPayItemNumber(template.payItemNumber);
        setPayItemDescription(template.payItemDescription);
        setUnitOfMeasurement(template.unitOfMeasurement);
        setOutputPerHour(template.outputPerHour);
        setCategory(template.category || '');
        setSpecification(template.specification || '');
        setNotes(template.notes || '');
        setOcmPercentage(template.ocmPercentage);
        setCpPercentage(template.cpPercentage);
        setVatPercentage(template.vatPercentage);
        setLaborItems(template.laborTemplate || []);
        setEquipmentItems(template.equipmentTemplate || []);
        setMaterialItems(template.materialTemplate || []);
      }
    } catch (error) {
      console.error('Failed to fetch template:', error);
      alert('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/master/equipment');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setEquipment(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/master/materials?active=true');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const addLaborItem = () => {
    setLaborItems([
      ...laborItems,
      { designation: 'Foreman', noOfPersons: 1, noOfHours: 8 },
    ]);
  };

  const updateLaborItem = (index: number, field: keyof LaborTemplate, value: any) => {
    const updated = [...laborItems];
    updated[index] = { ...updated[index], [field]: value };
    setLaborItems(updated);
  };

  const removeLaborItem = (index: number) => {
    setLaborItems(laborItems.filter((_, i) => i !== index));
  };

  const addEquipmentItem = () => {
    if (equipment.length === 0) {
      alert('No equipment available. Please add equipment first.');
      return;
    }
    setEquipmentItems([
      ...equipmentItems,
      {
        equipmentId: equipment[0]._id,
        description: equipment[0].description,
        noOfUnits: 1,
        noOfHours: 8,
      },
    ]);
  };

  const updateEquipmentItem = (index: number, field: keyof EquipmentTemplate, value: any) => {
    const updated = [...equipmentItems];
    if (field === 'equipmentId') {
      const selected = equipment.find((e) => e._id === value);
      if (selected) {
        updated[index].equipmentId = value;
        updated[index].description = selected.description;
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEquipmentItems(updated);
  };

  const removeEquipmentItem = (index: number) => {
    setEquipmentItems(equipmentItems.filter((_, i) => i !== index));
  };

  const addMaterialItem = () => {
    if (materials.length === 0) {
      alert('No materials available. Please add materials to the database first.');
      return;
    }
    const firstMaterial = materials[0];
    setMaterialItems([
      ...materialItems,
      { 
        materialCode: firstMaterial.materialCode || '', 
        description: firstMaterial.materialDescription || 'N/A', 
        unit: firstMaterial.unit, 
        quantity: 1 
      },
    ]);
  };

  const updateMaterialItem = (index: number, field: keyof MaterialTemplate, value: any) => {
    const updated = [...materialItems];
    if (field === 'materialCode') {
      const selected = materials.find((m) => m.materialCode === value);
      if (selected) {
        updated[index].materialCode = value;
        updated[index].description = selected.materialDescription;
        updated[index].unit = selected.unit;
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setMaterialItems(updated);
  };

  const removeMaterialItem = (index: number) => {
    setMaterialItems(materialItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const templateData = {
      payItemNumber,
      payItemDescription,
      unitOfMeasurement,
      outputPerHour,
      category,
      specification,
      notes,
      ocmPercentage,
      cpPercentage,
      vatPercentage,
      laborTemplate: laborItems,
      equipmentTemplate: equipmentItems,
      materialTemplate: materialItems,
      isActive: true,
    };

    try {
      const response = await fetch(`/api/dupa-templates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not OK:', response.status, text);
        throw new Error(`Server returned ${response.status}: ${text}`);
      }

      const result = await response.json();

      if (result.success) {
        router.push('/dupa-templates');
      } else {
        console.error('Update failed:', result);
        alert('Failed to update template: ' + (result.error || 'Unknown error') + (result.details ? '\nDetails: ' + result.details : ''));
      }
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit DUPA Template</h1>
        <p className="text-gray-600">
          Update template structure and quantities
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading template...</div>
        </div>
      ) : (

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Item Number *
              </label>
              <input
                type="text"
                required
                value={payItemNumber}
                onChange={(e) => setPayItemNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Earthwork, Concrete"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Item Description *
              </label>
              <textarea
                required
                value={payItemDescription}
                onChange={(e) => setPayItemDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measurement *
              </label>
              <input
                type="text"
                required
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., cu.m., sq.m."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output per Hour *
              </label>
              <input
                type="number"
                required
                step="0.001"
                value={outputPerHour}
                onChange={(e) => setOutputPerHour(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specification
              </label>
              <textarea
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Add-on Percentages */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add-on Percentages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OCM %
              </label>
              <input
                type="number"
                step="0.01"
                value={ocmPercentage}
                onChange={(e) => setOcmPercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CP %
              </label>
              <input
                type="number"
                step="0.01"
                value={cpPercentage}
                onChange={(e) => setCpPercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VAT %
              </label>
              <input
                type="number"
                step="0.01"
                value={vatPercentage}
                onChange={(e) => setVatPercentage(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Labor Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Labor</h2>
            <button
              type="button"
              onClick={addLaborItem}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Labor
            </button>
          </div>
          {laborItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No labor items added. Click "Add Labor" to begin.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Designation
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Persons
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {laborItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <select
                          value={item.designation}
                          onChange={(e) =>
                            updateLaborItem(index, 'designation', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          {LABOR_DESIGNATIONS.map((des) => (
                            <option key={des} value={des}>
                              {des}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.noOfPersons}
                          onChange={(e) =>
                            updateLaborItem(
                              index,
                              'noOfPersons',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.noOfHours}
                          onChange={(e) =>
                            updateLaborItem(
                              index,
                              'noOfHours',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeLaborItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Equipment Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Equipment</h2>
            <button
              type="button"
              onClick={addEquipmentItem}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Equipment
            </button>
          </div>
          {equipmentItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No equipment items added. Click "Add Equipment" to begin.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Equipment
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Units
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Hours
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {equipmentItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <select
                          value={item.equipmentId}
                          onChange={(e) =>
                            updateEquipmentItem(index, 'equipmentId', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          {equipment.map((eq) => (
                            <option key={eq._id} value={eq._id}>
                              {eq.description}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.noOfUnits}
                          onChange={(e) =>
                            updateEquipmentItem(
                              index,
                              'noOfUnits',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.noOfHours}
                          onChange={(e) =>
                            updateEquipmentItem(
                              index,
                              'noOfHours',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeEquipmentItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Material Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Materials</h2>
            <button
              type="button"
              onClick={addMaterialItem}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Add Material
            </button>
          </div>
          {materialItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No material items added. Click "Add Material" to begin.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase" colSpan={2}>
                      Material
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materialItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2" colSpan={2}>
                        <select
                          value={item.materialCode}
                          onChange={(e) =>
                            updateMaterialItem(index, 'materialCode', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {materials.map((mat) => (
                            <option key={mat._id} value={mat.materialCode}>
                              {mat.materialDescription} ({mat.materialCode})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.unit}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) =>
                            updateMaterialItem(
                              index,
                              'quantity',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeMaterialItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Update Template'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
