'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DUPATemplate {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  outputPerHour: number;
  category: string;
  specification: string;
  notes: string;
  laborTemplate: Array<{
    designation: string;
    noOfPersons: number;
    noOfHours: number;
  }>;
  equipmentTemplate: Array<{
    equipmentId?: string;
    description: string;
    noOfUnits: number;
    noOfHours: number;
  }>;
  materialTemplate: Array<{
    materialCode?: string;
    description: string;
    unit: string;
    quantity: number;
  }>;
  ocmPercentage: number;
  cpPercentage: number;
  vatPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DUPATemplateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<DUPATemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchTemplate();
    }
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dupa-templates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setTemplate(data.data);
      } else {
        setError(data.error || 'Failed to fetch template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    if (!confirm(`Are you sure you want to delete template "${template.payItemNumber}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dupa-templates/${template._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dupa-templates');
      } else {
        alert(data.error || 'Failed to delete template');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-500">Loading template...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Template not found'}
          </div>
          <Link
            href="/dupa-templates"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dupa-templates"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Templates
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {template.payItemNumber}
              </h1>
              <p className="text-gray-600 mt-1">{template.payItemDescription}</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/dupa-templates/${template._id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Pay Item Number</label>
              <p className="mt-1 text-gray-900">{template.payItemNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Unit of Measurement</label>
              <p className="mt-1 text-gray-900">{template.unitOfMeasurement}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Output per Hour</label>
              <p className="mt-1 text-gray-900">{template.outputPerHour}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Category</label>
              <p className="mt-1 text-gray-900">{template.category || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  template.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {template.specification && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500">Specification</label>
              <p className="mt-1 text-gray-900">{template.specification}</p>
            </div>
          )}

          {template.notes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-500">Notes</label>
              <p className="mt-1 text-gray-900">{template.notes}</p>
            </div>
          )}
        </div>

        {/* Labor Template */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Labor Template ({template.laborTemplate.length})
          </h2>
          {template.laborTemplate.length === 0 ? (
            <p className="text-gray-500">No labor entries</p>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.laborTemplate.map((labor, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{labor.designation}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{labor.noOfPersons}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{labor.noOfHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Equipment Template */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Equipment Template ({template.equipmentTemplate.length})
          </h2>
          {template.equipmentTemplate.length === 0 ? (
            <p className="text-gray-500">No equipment entries</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Units
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      No. of Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.equipmentTemplate.map((equip, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{equip.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{equip.noOfUnits}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{equip.noOfHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Material Template */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Material Template ({template.materialTemplate.length})
          </h2>
          {template.materialTemplate.length === 0 ? (
            <p className="text-gray-500">No material entries</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {template.materialTemplate.map((material, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{material.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{material.unit}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{material.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add-on Percentages */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add-on Percentages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">OCM</label>
              <p className="mt-1 text-gray-900">{template.ocmPercentage}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">CP</label>
              <p className="mt-1 text-gray-900">{template.cpPercentage}%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">VAT</label>
              <p className="mt-1 text-gray-900">{template.vatPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-gray-900">
                {new Date(template.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Updated</label>
              <p className="mt-1 text-gray-900">
                {new Date(template.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
