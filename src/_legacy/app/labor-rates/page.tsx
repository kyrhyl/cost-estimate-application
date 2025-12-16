'use client';

import { useState, useEffect } from 'react';

interface LaborRate {
  _id: string;
  location: string;
  district: string;
  foreman: number;
  leadman: number;
  equipmentOperatorHeavy: number;
  equipmentOperatorHighSkilled: number;
  equipmentOperatorLightSkilled: number;
  driver: number;
  laborSkilled: number;
  laborSemiSkilled: number;
  laborUnskilled: number;
  effectiveDate: string;
}

export default function LaborRatesPage() {
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LaborRate>>({});

  useEffect(() => {
    fetchLaborRates();
  }, []);

  const fetchLaborRates = async () => {
    try {
      const response = await fetch('/api/labor-rates');
      const data = await response.json();

      if (data.success) {
        setLaborRates(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDefaultRates = async () => {
    const defaultRates = [
      { location: 'Cabangasan', district: 'Bukidnon 1st', foreman: 125.73, leadman: 115.23, equipmentOperatorHeavy: 104.96, equipmentOperatorHighSkilled: 98.11, equipmentOperatorLightSkilled: 91.04, driver: 91.04, laborSkilled: 91.04, laborSemiSkilled: 84.09, laborUnskilled: 70.17 },
      { location: 'Impasug-ong', district: 'Bukidnon 1st', foreman: 125.73, leadman: 115.23, equipmentOperatorHeavy: 104.96, equipmentOperatorHighSkilled: 98.11, equipmentOperatorLightSkilled: 91.04, driver: 91.04, laborSkilled: 91.04, laborSemiSkilled: 84.09, laborUnskilled: 70.17 },
      { location: 'Lantapan', district: 'Bukidnon 1st', foreman: 125.73, leadman: 115.23, equipmentOperatorHeavy: 104.96, equipmentOperatorHighSkilled: 98.11, equipmentOperatorLightSkilled: 91.04, driver: 91.04, laborSkilled: 91.04, laborSemiSkilled: 84.09, laborUnskilled: 70.17 },
      { location: 'Jose Fernando', district: 'Bukidnon 1st', foreman: 125.73, leadman: 115.23, equipmentOperatorHeavy: 104.96, equipmentOperatorHighSkilled: 98.11, equipmentOperatorLightSkilled: 91.04, driver: 91.04, laborSkilled: 91.04, laborSemiSkilled: 84.09, laborUnskilled: 70.17 },
      { location: 'Malaybalay City', district: 'Bukidnon 1st', foreman: 129.83, leadman: 119.23, equipmentOperatorHeavy: 108.41, equipmentOperatorHighSkilled: 101.35, equipmentOperatorLightSkilled: 94.06, driver: 94.06, laborSkilled: 94.06, laborSemiSkilled: 86.9, laborUnskilled: 72.55 }
    ];

    try {
      const response = await fetch('/api/labor-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultRates),
      });

      const result = await response.json();
      if (result.success) {
        alert('Default labor rates added successfully');
        fetchLaborRates();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (rate: LaborRate) => {
    setEditingId(rate._id);
    setEditValues(rate);
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/labor-rates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      const result = await response.json();
      if (result.success) {
        setLaborRates(laborRates.map(r => r._id === id ? result.data : r));
        setEditingId(null);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading labor rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-full mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">DOLE Labor Rates per Hour</h1>
          <p className="text-gray-600">Location-based labor rates for project estimation</p>
        </div>
        {laborRates.length === 0 && (
          <button
            onClick={addDefaultRates}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            + Add Default Rates
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {laborRates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">👷</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No labor rates configured</h2>
          <p className="text-gray-600 mb-6">Add DOLE labor rates to start</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-700">Location</th>
                  <th className="px-4 py-3 text-right">Foreman</th>
                  <th className="px-4 py-3 text-right">Leadman</th>
                  <th className="px-4 py-3 text-right">Equip Op (Heavy)</th>
                  <th className="px-4 py-3 text-right">Equip Op (High)</th>
                  <th className="px-4 py-3 text-right">Equip Op (Light)</th>
                  <th className="px-4 py-3 text-right">Driver</th>
                  <th className="px-4 py-3 text-right">Labor Skilled</th>
                  <th className="px-4 py-3 text-right">Labor Semi-Skilled</th>
                  <th className="px-4 py-3 text-right">Labor Unskilled</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {laborRates.map((rate) => {
                  const isEditing = editingId === rate._id;
                  return (
                    <tr key={rate._id} className={isEditing ? "bg-yellow-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit">{rate.location}</td>
                      {['foreman', 'leadman', 'equipmentOperatorHeavy', 'equipmentOperatorHighSkilled', 'equipmentOperatorLightSkilled', 'driver', 'laborSkilled', 'laborSemiSkilled', 'laborUnskilled'].map((field) => (
                        <td key={field} className="px-4 py-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editValues[field as keyof LaborRate] as number}
                              onChange={(e) => setEditValues({...editValues, [field]: parseFloat(e.target.value) || 0})}
                              className="w-24 px-2 py-1 border border-blue-500 rounded text-right"
                            />
                          ) : (
                            <span className="font-medium text-blue-700">{formatCurrency(rate[field as keyof LaborRate] as number)}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => saveEdit(rate._id)} className="text-green-600 hover:text-green-800 text-sm px-2 py-1 rounded hover:bg-green-50">✓ Save</button>
                            <button onClick={cancelEdit} className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50">✕ Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(rate)} className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50">✏️ Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
