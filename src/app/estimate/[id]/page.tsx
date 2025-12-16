'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Breakdown {
  directCostSubmitted: number;
  directCostEvaluated: number;
  ocmSubmitted: number;
  ocmEvaluated: number;
  cpSubmitted: number;
  cpEvaluated: number;
  vatSubmitted: number;
  vatEvaluated: number;
  totalSubmitted: number;
  totalEvaluated: number;
}

interface BOQLine {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  payItemNumber?: string;
  unitRate?: number;
  totalAmount?: number;
  breakdown?: Breakdown;
}

interface Estimate {
  _id: string;
  projectName: string;
  projectLocation: string;
  implementingOffice: string;
  boqLines: BOQLine[];
  totalDirectCostSubmitted: number;
  totalDirectCostEvaluated: number;
  totalOCMSubmitted: number;
  totalOCMEvaluated: number;
  totalCPSubmitted: number;
  totalCPEvaluated: number;
  totalVATSubmitted: number;
  totalVATEvaluated: number;
  grandTotalSubmitted: number;
  grandTotalEvaluated: number;
  createdAt: string;
}

export default function EstimateDetailsPage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'submitted' | 'evaluated'>('submitted');

  useEffect(() => {
    fetchEstimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setEstimate(data.data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading estimate...</div>;
  }

  if (error || !estimate) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded my-8">
        {error || 'Estimate not found'}
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{estimate.projectName}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Location:</span> {estimate.projectLocation}</p>
              <p><span className="font-medium">Implementing Office:</span> {estimate.implementingOffice}</p>
              <p><span className="font-medium">Date Created:</span> {new Date(estimate.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">Grand Total</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(viewMode === 'submitted' ? estimate.grandTotalSubmitted : estimate.grandTotalEvaluated)}
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex justify-between items-center gap-2 mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('submitted')}
              className={viewMode === 'submitted' ? 'primary text-sm' : 'secondary text-sm'}
            >
              As Submitted
            </button>
            <button
              onClick={() => setViewMode('evaluated')}
              className={viewMode === 'evaluated' ? 'primary text-sm' : 'secondary text-sm'}
            >
              As Evaluated
            </button>
          </div>
          <div className="flex gap-2">
            <a
              href={`/estimate/${params.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              ✏️ Edit Estimate
            </a>
            <a
              href={`/estimate/${params.id}/reports`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              📊 View Reports
            </a>
          </div>
        </div>
      </div>

      {/* BOQ Lines Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          Bill of Quantities
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="w-20">Item No.</th>
                <th className="w-1/3">Description</th>
                <th className="w-20">Unit</th>
                <th className="w-24">Quantity</th>
                <th className="w-32">Unit Rate</th>
                <th className="w-32">Amount</th>
                <th className="w-32">Pay Item</th>
              </tr>
            </thead>
            <tbody>
              {estimate.boqLines.map((line, index) => (
                <tr key={index}>
                  <td className="font-mono text-center">{line.itemNo}</td>
                  <td>{line.description}</td>
                  <td className="text-center">{line.unit}</td>
                  <td className="text-right">{line.quantity.toFixed(2)}</td>
                  <td className="text-right font-mono">
                    {line.unitRate ? formatCurrency(line.unitRate) : '-'}
                  </td>
                  <td className="text-right font-mono font-semibold">
                    {line.totalAmount ? formatCurrency(line.totalAmount) : '-'}
                  </td>
                  <td className="text-center font-mono text-xs">
                    {line.payItemNumber || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          Cost Summary Breakdown
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Cost Component</th>
                <th className="text-right">As Submitted</th>
                <th className="text-right">As Evaluated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">Direct Cost (Labor + Equipment + Material)</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalDirectCostSubmitted)}</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalDirectCostEvaluated)}</td>
              </tr>
              <tr>
                <td className="pl-4">+ Overhead, Contingencies & Miscellaneous (OCM)</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalOCMSubmitted)}</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalOCMEvaluated)}</td>
              </tr>
              <tr>
                <td className="pl-4">+ Contractor's Profit (CP)</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalCPSubmitted)}</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalCPEvaluated)}</td>
              </tr>
              <tr>
                <td className="pl-4">+ Value Added Tax (VAT)</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalVATSubmitted)}</td>
                <td className="text-right font-mono">{formatCurrency(estimate.totalVATEvaluated)}</td>
              </tr>
              <tr className="border-t-2 border-gray-700">
                <td className="font-bold text-lg pt-2">Grand Total</td>
                <td className="text-right font-mono font-bold text-lg pt-2 text-blue-600">
                  {formatCurrency(estimate.grandTotalSubmitted)}
                </td>
                <td className="text-right font-mono font-bold text-lg pt-2 text-blue-600">
                  {formatCurrency(estimate.grandTotalEvaluated)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Line Item Breakdowns */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-700 text-white font-semibold">
          Detailed Line Item Breakdowns
        </div>
        <div className="p-6 space-y-6">
          {estimate.boqLines
            .filter(line => line.breakdown)
            .map((line, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <h3 className="font-semibold mb-2">
                  {line.itemNo}: {line.description}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  Quantity: {line.quantity} {line.unit} | Pay Item: {line.payItemNumber}
                </div>
                {line.breakdown && (
                  <div className="bg-gray-50 p-4 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left text-xs">Component</th>
                          <th className="text-right text-xs">Submitted</th>
                          <th className="text-right text-xs">Evaluated</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Direct Cost</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.directCostSubmitted)}</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.directCostEvaluated)}</td>
                        </tr>
                        <tr>
                          <td className="pl-2">+ OCM</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.ocmSubmitted)}</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.ocmEvaluated)}</td>
                        </tr>
                        <tr>
                          <td className="pl-2">+ CP</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.cpSubmitted)}</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.cpEvaluated)}</td>
                        </tr>
                        <tr>
                          <td className="pl-2">+ VAT</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.vatSubmitted)}</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.vatEvaluated)}</td>
                        </tr>
                        <tr className="border-t font-semibold">
                          <td>Unit Rate</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.totalSubmitted)}</td>
                          <td className="text-right font-mono">{formatCurrency(line.breakdown.totalEvaluated)}</td>
                        </tr>
                        <tr className="font-semibold text-blue-600">
                          <td>Total ({line.quantity} {line.unit})</td>
                          <td className="text-right font-mono">
                            {formatCurrency(line.breakdown.totalSubmitted * line.quantity)}
                          </td>
                          <td className="text-right font-mono">
                            {formatCurrency(line.breakdown.totalEvaluated * line.quantity)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <a href={`/estimate/${params.id}/reports`} className="primary">
          📊 View DPWH Reports
        </a>
        <button
          onClick={() => window.print()}
          className="secondary"
        >
          🖨️ Print
        </button>
        <a href="/estimate/new" className="secondary">
          Create Another Estimate
        </a>
        <a href="/" className="secondary">
          Back to Home
        </a>
      </div>
    </div>
  );
}
