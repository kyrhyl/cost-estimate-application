'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  projectName: string;
  projectLocation: string;
  district?: string;
  status: string;
  appropriation?: string;
}

interface DUPATemplate {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  category?: string;
  isActive: boolean;
}

interface BOQItem {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  category?: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [templates, setTemplates] = useState<DUPATemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchBOQ();
    fetchTemplates();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const result = await response.json();
      if (result.success) {
        setProject(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const fetchBOQ = async () => {
    try {
      const response = await fetch(`/api/project-boq?projectId=${params.id}`);
      const result = await response.json();
      if (result.success) {
        setBoqItems(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch BOQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/dupa-templates?active=true');
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleAddBOQItem = async () => {
    if (!selectedTemplate || !project) return;
    
    setAdding(true);
    try {
      // Step 1: Instantiate template with project location and hauling cost
      const instantiateResponse = await fetch(
        `/api/dupa-templates/${selectedTemplate}/instantiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: project.projectLocation,
            quantity,
            projectId: params.id, // Pass project ID for hauling cost calculation
          }),
        }
      );

      const instantiateResult = await instantiateResponse.json();

      if (!instantiateResult.success) {
        alert('Failed to instantiate template: ' + instantiateResult.error);
        return;
      }

      const computed = instantiateResult.data;

      // Step 2: Create BOQ item with computed values
      const boqData = {
        projectId: params.id,
        templateId: selectedTemplate,
        payItemNumber: computed.payItemNumber,
        payItemDescription: computed.payItemDescription,
        unitOfMeasurement: computed.unitOfMeasurement,
        outputPerHour: computed.outputPerHour,
        quantity,
        
        // Map computed arrays to BOQ schema field names
        laborItems: computed.laborComputed,
        equipmentItems: computed.equipmentComputed,
        materialItems: computed.materialComputed,
        
        // Cost fields
        directCost: computed.directCost,
        ocmPercentage: computed.ocmPercentage,
        ocmCost: computed.ocmCost,
        cpPercentage: computed.cpPercentage,
        cpCost: computed.cpCost,
        subtotalWithMarkup: computed.subtotalWithMarkup,
        vatPercentage: computed.vatPercentage,
        vatCost: computed.vatCost,
        totalCost: computed.totalCost,
        unitCost: computed.unitCost,
        totalAmount: computed.totalCost * quantity,
        
        // Metadata
        location: computed.location,
        instantiatedAt: new Date(),
      };

      const createResponse = await fetch('/api/project-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boqData),
      });

      const createResult = await createResponse.json();

      if (createResult.success) {
        setShowAddModal(false);
        setSelectedTemplate('');
        setQuantity(1);
        fetchBOQ();
      } else {
        const errorMsg = createResult.error + (createResult.details ? '\n\nDetails: ' + createResult.details : '');
        console.error('BOQ creation failed:', createResult);
        alert('Failed to add BOQ item: ' + errorMsg);
      }
    } catch (error) {
      console.error('Failed to add BOQ item:', error);
      alert('Failed to add BOQ item');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBOQItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this BOQ item?')) return;

    try {
      const response = await fetch(`/api/project-boq/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        fetchBOQ();
      } else {
        alert('Failed to delete BOQ item: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete BOQ item:', error);
      alert('Failed to delete BOQ item');
    }
  };

  const totalProjectCost = boqItems.reduce((sum, item) => sum + item.totalAmount, 0);

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Project Header */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.projectName}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span><strong>Location:</strong> {project.projectLocation}</span>
              {project.district && <span><strong>District:</strong> {project.district}</span>}
              <span><strong>Status:</strong> {project.status}</span>
            </div>
            {project.appropriation && (
              <div className="text-sm text-gray-600 mt-1">
                <strong>Appropriation:</strong> {project.appropriation}
              </div>
            )}
          </div>
          <button
            onClick={() => router.push(`/projects/${params.id}/edit`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Edit Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-600">Total BOQ Items</div>
            <div className="text-2xl font-bold">{boqItems.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-600">Total Quantity</div>
            <div className="text-2xl font-bold">
              {boqItems.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="text-sm text-gray-600">Total Project Cost</div>
            <div className="text-2xl font-bold">
              ₱{totalProjectCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* BOQ Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Bill of Quantities</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            + Add BOQ Item
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pay Item No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boqItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No BOQ items yet. Click "Add BOQ Item" to select a DUPA template.
                  </td>
                </tr>
              ) : (
                boqItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{item.payItemNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{item.payItemDescription}</div>
                      {item.category && (
                        <div className="text-xs text-gray-500">{item.category}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.unitOfMeasurement}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ₱{item.unitCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₱{item.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-3">
                      <button
                        onClick={() => router.push(`/projects/${params.id}/boq/${item._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View DUPA
                      </button>
                      <button
                        onClick={() => handleDeleteBOQItem(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add BOQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Add BOQ Item from Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select DUPA Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Select Template --</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.payItemNumber} - {template.payItemDescription}
                      {template.category && ` (${template.category})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> The template will be instantiated with rates for{' '}
                  <strong>{project.projectLocation}</strong>. Labor rates, equipment rates, and 
                  material prices will be applied automatically based on this location.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTemplate('');
                  setQuantity(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBOQItem}
                disabled={!selectedTemplate || adding}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {adding ? 'Adding...' : 'Add to BOQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
