'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { exportBOQToExcel } from '@/lib/export/excel';

interface BOQLineInput {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  payItemNumber: string;
  part?: string;
  partDescription?: string;
  division?: string;
}

interface RateItem {
  _id: string;
  payItemNumber: string;
  payItemDescription: string;
  unitOfMeasurement: string;
}

export default function EditEstimatePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');

  // Project info
  const [contractId, setContractId] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractLocation, setContractLocation] = useState('');
  const [partNo, setPartNo] = useState('');
  const [partDescription, setPartDescription] = useState('');

  // Manual BOQ Lines
  const [boqLines, setBOQLines] = useState<BOQLineInput[]>([
    { itemNo: '', description: '', unit: '', quantity: 0, payItemNumber: '', part: '', partDescription: '', division: '' }
  ]);

  // Rate Items for dropdown
  const [rateItems, setRateItems] = useState<RateItem[]>([]);
  const [loadingRates, setLoadingRates] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchRateItems();
    fetchEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchRateItems = async () => {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();
      if (data.success) {
        setRateItems(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rate items:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const estimate = data.data;
        setContractId(estimate.contractId || '');
        setContractName(estimate.projectName || '');
        setContractLocation(estimate.projectLocation || '');
        setPartNo(estimate.partNo || '');
        setPartDescription(estimate.partDescription || '');
        
        // Map BOQ lines
        if (estimate.boqLines && estimate.boqLines.length > 0) {
          setBOQLines(estimate.boqLines.map((line: any) => ({
            itemNo: line.itemNo || '',
            description: line.description || '',
            unit: line.unit || '',
            quantity: line.quantity || 0,
            payItemNumber: line.payItemNumber || line.itemNo || '',
            part: line.part || '',
            partDescription: line.partDescription || '',
            division: line.division || ''
          })));
        }
      } else {
        setError(data.error || 'Failed to load estimate');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred while loading the estimate');
    } finally {
      setFetchingData(false);
    }
  };

  const addBOQLine = () => {
    const lastLine = boqLines[boqLines.length - 1];
    setBOQLines([...boqLines, { 
      itemNo: '', 
      description: '', 
      unit: '', 
      quantity: 0, 
      payItemNumber: '',
      part: lastLine?.part || '',
      partDescription: lastLine?.partDescription || '',
      division: lastLine?.division || ''
    }]);
  };

  const removeBOQLine = (index: number) => {
    if (boqLines.length > 1) {
      setBOQLines(boqLines.filter((_, i) => i !== index));
    }
  };

  const updateBOQLine = (index: number, field: keyof BOQLineInput, value: any) => {
    const updated = [...boqLines];
    updated[index] = { ...updated[index], [field]: value };
    setBOQLines(updated);
  };

  const handleRateItemSelect = (index: number, payItemNumber: string) => {
    const selectedRate = rateItems.find(r => r.payItemNumber === payItemNumber);
    if (selectedRate) {
      const updated = [...boqLines];
      updated[index] = {
        ...updated[index],
        itemNo: selectedRate.payItemNumber,
        payItemNumber: selectedRate.payItemNumber,
        description: selectedRate.payItemDescription,
        unit: selectedRate.unitOfMeasurement
      };
      setBOQLines(updated);
    } else {
      const updated = [...boqLines];
      updated[index] = {
        ...updated[index],
        itemNo: payItemNumber,
        payItemNumber: payItemNumber
      };
      setBOQLines(updated);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      // Fetch full estimate data for export
      const response = await fetch(`/api/estimates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const estimate = data.data;
        const exportData = {
          projectName: estimate.projectName,
          projectLocation: estimate.projectLocation,
          implementingOffice: estimate.implementingOffice || 'DPWH',
          contractId: estimate.contractId || '',
          date: new Date().toISOString().split('T')[0],
          items: estimate.boqLines.map((line: any) => ({
            payItemNumber: line.payItemNumber || line.itemNo,
            payItemDescription: line.description,
            unitOfMeasurement: line.unit,
            quantity: line.quantity,
            unitCost: line.unitRate || 0,
            totalAmount: line.totalAmount || 0,
            category: line.part || '',
          })),
          totalDirectCost: estimate.totalDirectCostSubmitted || 0,
          grandTotal: estimate.grandTotalSubmitted || 0,
        };

        exportBOQToExcel(exportData, `BOQ-${estimate.contractId || 'estimate'}-${params.id}.xlsx`);
      } else {
        setError('Failed to fetch estimate data for export');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty lines
      const validLines = boqLines.filter(line => 
        ((line.itemNo && line.itemNo.trim() !== '') || (line.payItemNumber && line.payItemNumber.trim() !== '')) &&
        line.description && line.description.trim() !== '' &&
        line.unit && line.unit.trim() !== '' &&
        line.quantity !== undefined && line.quantity !== null && !isNaN(line.quantity) && line.quantity > 0
      ).map(line => ({
        ...line,
        itemNo: line.itemNo || line.payItemNumber
      }));

      if (validLines.length === 0) {
        throw new Error('Please add at least one complete BOQ item with Item No, Description, Unit, and Quantity.');
      }

      const requestBody = {
        projectName: contractName || 'Untitled Project',
        projectLocation: contractLocation || 'N/A',
        implementingOffice: 'DPWH',
        contractId,
        partNo,
        partDescription,
        boqLines: validLines
      };

      const response = await fetch(`/api/estimates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/estimate/${params.id}`);
      } else {
        setError(result.error || 'Failed to update estimate');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'An error occurred while updating the estimate');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="text-center py-8">Loading estimate...</div>;
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Estimate</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* DPWH BOQ Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-blue-900">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600">Republic of the Philippines</div>
            <div className="font-bold text-lg">Department of Public Works and Highways</div>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-sm mb-4">
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Contract ID:</label>
              <input 
                type="text" 
                className="col-span-3 border-b border-gray-400 bg-transparent px-2" 
                placeholder="e.g., 26KA"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Contract Name:</label>
              <input 
                type="text" 
                className="col-span-3 border-b border-gray-400 bg-transparent px-2" 
                placeholder="Construction (Completion) of Multi-Purpose Building..."
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <label className="font-semibold">Contract Location:</label>
              <input 
                type="text" 
                className="col-span-3 border-b border-gray-400 bg-transparent px-2" 
                placeholder="Brgy. Violeta, Malaybalay City, Bukidnon"
                value={contractLocation}
                onChange={(e) => setContractLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center mt-6 mb-4">
            <div className="font-bold text-xl">BILL OF QUANTITIES</div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-300 pt-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Part No:</label>
              <input
                type="text"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., PART B, ITEM 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Part Description:</label>
              <input
                type="text"
                value={partDescription}
                onChange={(e) => setPartDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                placeholder="e.g., EARTHWORK, BUILDINGS"
              />
            </div>
          </div>
        </div>

        {/* BOQ Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bill of Quantities Items</h2>
            <button type="button" onClick={addBOQLine} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
              + Add Line
            </button>
          </div>

          <div className="text-xs text-gray-500 mb-3 italic">
            Columns (1), (2), (3), and (4) are to be filled up by the Procuring Entity.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 px-2 py-2 text-xs w-24">Part</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-32">Part Description</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-20">Division</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-16">Pay Item No.<br/>(1)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-1/4">Description<br/>(2)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-16">Unit<br/>(3)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-20">Quantity<br/>(4)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs w-12"></th>
                </tr>
              </thead>
              <tbody>
                {boqLines.map((line, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={line.part || ''}
                        onChange={(e) => updateBOQLine(index, 'part', e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="PART B"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={line.partDescription || ''}
                        onChange={(e) => updateBOQLine(index, 'partDescription', e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="EARTHWORK"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={line.division || ''}
                        onChange={(e) => updateBOQLine(index, 'division', e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="DIV I"
                      />
                    </td>
                    <td className="border border-gray-300 p-1 bg-yellow-50">
                      <select
                        value={line.payItemNumber}
                        onChange={(e) => handleRateItemSelect(index, e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        title="Select Rate Item to auto-fill description and unit"
                      >
                        <option value="">-- Select --</option>
                        {rateItems.map((rate) => (
                          <option key={rate._id} value={rate.payItemNumber}>
                            {rate.payItemNumber}
                          </option>
                        ))}
                      </select>
                      {loadingRates && (
                        <div className="text-xs text-gray-500 text-center">Loading...</div>
                      )}
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateBOQLine(index, 'description', e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Description"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="text"
                        value={line.unit}
                        onChange={(e) => updateBOQLine(index, 'unit', e.target.value)}
                        className="w-full px-1 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="l.s."
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <input
                        type="number"
                        step="0.01"
                        value={line.quantity || ''}
                        onChange={(e) => updateBOQLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-1 py-1 text-xs text-right border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-gray-300 p-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeBOQLine(index)}
                        className="text-red-600 hover:text-red-800 text-xs px-1"
                        disabled={boqLines.length === 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <strong>💡 Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Select a rate item from the dropdown in the "Pay Item No." column to auto-fill Description and Unit</li>
              <li>All fields (Pay Item No., Description, Unit, Quantity) must be filled for each row</li>
              <li>Empty or incomplete rows will be automatically removed when you save</li>
            </ul>
          </div>
        </div>

        {/* Calculation Preview Panel */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 BOQ Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-blue-600">
                {boqLines.filter(line => line.payItemNumber && line.description && line.quantity > 0).length}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Total Quantity</div>
              <div className="text-2xl font-bold text-green-600">
                {boqLines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Unique Units</div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(boqLines.filter(l => l.unit).map(l => l.unit)).size}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Parts/Divisions</div>
              <div className="text-2xl font-bold text-orange-600">
                {new Set(boqLines.filter(l => l.part).map(l => l.part)).size}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
            <strong>ℹ️ Note:</strong> Cost calculations will be performed after applying labor, material, and equipment rates. 
            Use the <a href={`/estimate/${params.id}`} className="text-blue-600 hover:underline">View Estimate</a> page 
            or <a href={`/estimate/${params.id}/reports`} className="text-blue-600 hover:underline">Reports</a> page to see final costs.
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {exporting ? '⏳ Exporting...' : '📊 Export to Excel'}
          </button>
          <a
            href={`/estimate/${params.id}`}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
