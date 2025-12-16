'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Material {
  _id: string;
  materialCode: string;
  materialDescription: string;
  unit: string;
  basePrice: number;
  category: string;
  isActive: boolean;
}

export default function MaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [search, categoryFilter]);

  const fetchMaterials = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('active', 'true');

      const response = await fetch(`/api/materials?${params}`);
      const result = await response.json();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = async () => {
    setImporting(true);
    try {
      // Parse CSV
      const lines = csvText.trim().split('\n');
      const materials = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length < 4) continue;

        const materialCode = parts[0].trim();
        const materialDescription = parts[1].trim();
        const unit = parts[2].trim();
        const priceStr = parts[3].trim().replace(/[₱,\s]/g, '');
        const basePrice = parseFloat(priceStr);

        if (materialCode && materialDescription && unit && !isNaN(basePrice)) {
          materials.push({
            materialCode,
            materialDescription,
            unit,
            basePrice,
          });
        }
      }

      const response = await fetch('/api/materials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Import complete! Success: ${result.data.success}, Failed: ${result.data.failed}`);
        if (result.data.errors.length > 0) {
          console.error('Import errors:', result.data.errors);
        }
        setShowImportModal(false);
        setCsvText('');
        fetchMaterials();
      } else {
        alert('Import failed: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to import:', error);
      alert('Failed to import materials');
    } finally {
      setImporting(false);
    }
  };

  const categories = ['MG01', 'MG02', 'MG03', 'MG04', 'MG05', 'MG06', 'MG07', 'MG08', 'MG09', 'MG10', 'MG99', 'MS01', 'MS02', 'MS03', 'MS04', 'MS05', 'MS06', 'MS07', 'MS08'];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Materials Reference Database</h1>
        <p className="text-gray-600">Base prices before hauling cost adjustments</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Material code or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading materials...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No materials found. Click "Import CSV" to load the materials database.
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">{material.materialCode}</td>
                    <td className="px-4 py-3 text-sm">{material.materialDescription}</td>
                    <td className="px-4 py-3 text-sm">{material.unit}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₱{material.basePrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {material.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Import Materials from CSV</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste CSV content with format: Material Code, Material Description, Unit, Price
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="MG01.0001,COMMON BORROW,CUM,544.64&#10;MG01.0002,SELECTED BORROW,CUM,585.20&#10;..."
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded font-mono text-sm"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvText('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={importing || !csvText.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
