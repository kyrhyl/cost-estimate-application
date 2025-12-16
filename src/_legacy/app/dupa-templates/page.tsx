'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DUPATemplate {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
  outputPerHour: number;
  category?: string;
  isActive: boolean;
}

export default function DUPATemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DUPATemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  const fetchTemplates = async () => {
    try {
      const url = filter === 'active' 
        ? '/api/dupa-templates?active=true'
        : '/api/dupa-templates';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filter, fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/dupa-templates/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchTemplates();
      } else {
        alert('Failed to delete template: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('Failed to delete template');
    }
  };

  const handleToggleActive = async (template: DUPATemplate) => {
    try {
      const response = await fetch(`/api/dupa-templates/${template._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">DUPA Templates</h1>
        <p className="text-gray-600">Manage reusable DUPA templates</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Templates
          </button>
        </div>

        <button
          onClick={() => router.push('/dupa-templates/new')}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + New Template
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pay Item No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Output/Hour
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No templates found. Create your first template to get started.
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {template.payItemNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {template.payItemDescription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.unitOfMeasurement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.outputPerHour}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(template)}
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        template.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/dupa-templates/${template._id}/edit`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>About DUPA Templates:</strong> Templates define the structure (labor designations, 
              equipment, materials) without location-specific rates. Use the instantiation API to apply 
              location-based rates when adding templates to projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
