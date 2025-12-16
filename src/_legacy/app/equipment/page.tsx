'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Equipment {
  _id: string;
  no: number;
  completeDescription: string;
  description: string;
  equipmentModel?: string;
  capacity?: string;
  flywheelHorsepower?: number;
  rentalRate: number;
  hourlyRate: number;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{rentalRate: number; hourlyRate: number}>({rentalRate: 0, hourlyRate: 0});

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();

      if (data.success) {
        setEquipment(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      
      const response = await fetch('/api/equipment/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: text,
          clearExisting: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Successfully imported ${result.count} equipment items`);
        fetchEquipment();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const startEdit = (eq: Equipment) => {
    setEditingId(eq._id);
    setEditValues({
      rentalRate: eq.rentalRate,
      hourlyRate: eq.hourlyRate
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({rentalRate: 0, hourlyRate: 0});
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setEquipment(equipment.map(eq => 
          eq._id === id ? { ...eq, ...editValues } : eq
        ));
        setEditingId(null);
        setEditValues({rentalRate: 0, hourlyRate: 0});
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.completeDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.equipmentModel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Equipment Database</h1>
          <p className="text-gray-600">Manage construction equipment and rental rates</p>
        </div>
        <div className="flex gap-3">
          <label className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium cursor-pointer">
            {importing ? 'Importing...' : '📤 Import CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search equipment by description, type, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Equipment List */}
      {equipment.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🚜</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No equipment in database</h2>
          <p className="text-gray-600 mb-6">Import your equipment CSV file to get started</p>
          <label className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 cursor-pointer">
            Import CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">No.</th>
                    <th className="px-4 py-3 text-left">Complete Description</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Model</th>
                    <th className="px-4 py-3 text-left">Capacity</th>
                    <th className="px-4 py-3 text-right">HP</th>
                    <th className="px-4 py-3 text-right">Daily Rate</th>
                    <th className="px-4 py-3 text-right">Hourly Rate</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEquipment.map((eq) => {
                    const isEditing = editingId === eq._id;
                    return (
                      <tr key={eq._id} className={isEditing ? "bg-yellow-50" : "hover:bg-gray-50"}>
                        <td className="px-4 py-3 font-medium text-gray-900">{eq.no}</td>
                        <td className="px-4 py-3">{eq.completeDescription}</td>
                        <td className="px-4 py-3 text-gray-600">{eq.description}</td>
                        <td className="px-4 py-3 text-gray-600">{eq.equipmentModel || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{eq.capacity || '-'}</td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {eq.flywheelHorsepower ? eq.flywheelHorsepower.toFixed(2) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.rentalRate}
                              onChange={(e) => setEditValues({...editValues, rentalRate: parseFloat(e.target.value) || 0})}
                              className="w-full px-2 py-1 border border-blue-500 rounded text-right"
                            />
                          ) : (
                            <span className="font-medium text-green-700">{formatCurrency(eq.rentalRate)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editValues.hourlyRate}
                              onChange={(e) => setEditValues({...editValues, hourlyRate: parseFloat(e.target.value) || 0})}
                              className="w-full px-2 py-1 border border-blue-500 rounded text-right"
                            />
                          ) : (
                            <span className="font-medium text-blue-700">{formatCurrency(eq.hourlyRate)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => saveEdit(eq._id)}
                                className="text-green-600 hover:text-green-800 text-sm px-2 py-1 rounded hover:bg-green-50"
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                              >
                                ✕ Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(eq)}
                              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                            >
                              ✏️ Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Equipment</div>
              <div className="text-3xl font-bold text-gray-800">{equipment.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Search Results</div>
              <div className="text-3xl font-bold text-blue-600">{filteredEquipment.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Daily Rate</div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(equipment.reduce((sum, eq) => sum + eq.rentalRate, 0) / equipment.length)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
