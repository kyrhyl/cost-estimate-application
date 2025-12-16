'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exportBOQToExcel, exportProjectSummaryToExcel } from '@/lib/export/excel';

interface BOQLine {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  payItemNumber?: string;
  part?: string;
  partDescription?: string;
  division?: string;
  unitRate?: number;
  totalAmount?: number;
  materialCost?: number;
  laborCost?: number;
  equipmentCost?: number;
  materialPercent?: number;
  laborPercent?: number;
  equipmentPercent?: number;
}

interface Estimate {
  _id: string;
  projectName: string;
  projectLocation: string;
  implementingOffice: string;
  boqLines: BOQLine[];
  totalDirectCostSubmitted: number;
  grandTotalSubmitted: number;
  createdAt: string;
}

interface GroupedLines {
  [key: string]: {
    lines: BOQLine[];
    subtotal: number;
    partDescription?: string;
    division?: string;
  };
}

export default function EstimateReportsPage() {
  const params = useParams();
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState<'breakdown' | 'budget' | 'summary'>('breakdown');
  const [exporting, setExporting] = useState(false);

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

  const groupByPart = (lines: BOQLine[]): GroupedLines => {
    const grouped: GroupedLines = {};
    
    lines.forEach(line => {
      const key = line.part || 'UNGROUPED';
      if (!grouped[key]) {
        grouped[key] = {
          lines: [],
          subtotal: 0,
          partDescription: line.partDescription,
          division: line.division
        };
      }
      grouped[key].lines.push(line);
      grouped[key].subtotal += line.totalAmount || 0;
    });

    return grouped;
  };

  const handleExportBOQ = () => {
    if (!estimate) return;
    
    setExporting(true);
    try {
      const exportData = {
        projectName: estimate.projectName,
        projectLocation: estimate.projectLocation,
        implementingOffice: estimate.implementingOffice || 'DPWH',
        contractId: '',
        date: new Date(estimate.createdAt).toISOString().split('T')[0],
        items: estimate.boqLines.map((line) => ({
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

      exportBOQToExcel(exportData, `BOQ-${estimate._id}.xlsx`);
    } catch (err: any) {
      setError(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSummary = () => {
    if (!estimate) return;
    
    setExporting(true);
    try {
      const items = estimate.boqLines.map((line) => ({
        payItemNumber: line.payItemNumber || line.itemNo,
        payItemDescription: line.description,
        unitOfMeasurement: line.unit,
        quantity: line.quantity,
        unitCost: line.unitRate || 0,
        totalAmount: line.totalAmount || 0,
        category: line.part || '',
      }));

      const exportData = {
        projectName: estimate.projectName,
        projectLocation: estimate.projectLocation,
        contractId: '',
        date: new Date(estimate.createdAt).toISOString().split('T')[0],
        items,
      };

      exportProjectSummaryToExcel(exportData, items, `Summary-${estimate._id}.xlsx`);
    } catch (err: any) {
      setError(err.message || 'Failed to export');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (error || !estimate) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded my-8">
        {error || 'Estimate not found'}
      </div>
    );
  }

  const grouped = groupByPart(estimate.boqLines);

  return (
    <div className="py-8 max-w-7xl mx-auto">
      {/* Export Actions */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={handleExportBOQ}
          disabled={exporting}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : '📥 Export BOQ to Excel'}
        </button>
        <button
          onClick={handleExportSummary}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : '📊 Export Summary to Excel'}
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('breakdown')}
            className={reportType === 'breakdown' ? 'primary text-sm' : 'secondary text-sm'}
          >
            📊 Detailed Breakdown (DPWH-QABP-13-14)
          </button>
          <button
            onClick={() => setReportType('budget')}
            className={reportType === 'budget' ? 'primary text-sm' : 'secondary text-sm'}
          >
            📋 Approved Budget (DPWH-QABP-13-15)
          </button>
          <button
            onClick={() => setReportType('summary')}
            className={reportType === 'summary' ? 'primary text-sm' : 'secondary text-sm'}
          >
            📄 Program of Works (DPWH-QABP-13-13)
          </button>
        </div>
      </div>

      {/* APPROVED BUDGET REPORT */}
      {reportType === 'budget' && (
        <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none">
          {/* DPWH Header */}
          <div className="p-6 border-b-2 border-gray-900">
            <div className="text-center mb-4">
              <div className="text-xs text-gray-600">Republic of the Philippines</div>
              <div className="font-bold">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
              <div className="font-bold text-lg mt-2">APPROVED BUDGET FOR THE CONTRACT</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <div><span className="font-semibold">Implementing Office:</span> {estimate.implementingOffice}</div>
                <div><span className="font-semibold">Address:</span> San Victorias St., Malaybalay City, Bukidnon</div>
                <div><span className="font-semibold">Project Name:</span> {estimate.projectName}</div>
              </div>
              <div className="text-right">
                <div><span className="font-semibold">Date Prepared:</span> {new Date(estimate.createdAt).toLocaleDateString()}</div>
                <div><span className="font-semibold">Contract Duration:</span> 100</div>
                <div className="text-xs mt-2">DPWH-QABP-13-15 Rev00</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              <div><span className="font-semibold">Project Location:</span> {estimate.projectLocation}</div>
            </div>
          </div>

          {/* Budget Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-2 py-2">ITEM NO.</th>
                  <th className="border border-gray-600 px-2 py-2">DESCRIPTION</th>
                  <th className="border border-gray-600 px-2 py-2">QUANTITY</th>
                  <th className="border border-gray-600 px-2 py-2">UNIT</th>
                  <th className="border border-gray-600 px-2 py-2">ESTIMATED DIRECT COST</th>
                  <th className="border border-gray-600 px-2 py-2">%</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL MARK-UP VALUE</th>
                  <th className="border border-gray-600 px-2 py-2">VAT</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL INDIRECT COST</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL COST</th>
                  <th className="border border-gray-600 px-2 py-2">UNIT COST</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(grouped).sort().map((partKey) => {
                  const group = grouped[partKey];
                  const groupDirectCost = group.lines.reduce((sum, l) => sum + ((l.materialCost || 0) + (l.laborCost || 0) + (l.equipmentCost || 0)), 0);
                  const groupMarkup = groupDirectCost * 0.25;
                  const groupVAT = (groupDirectCost + groupMarkup) * 0.12;
                  const groupIndirect = groupMarkup + groupVAT;
                  
                  return (
                    <React.Fragment key={partKey}>
                      {/* Part Header */}
                      <tr className="bg-gray-700 text-white font-bold">
                        <td className="border border-gray-600 px-2 py-1" colSpan={2}>
                          {partKey} - {group.partDescription || 'OTHER REQUIREMENTS'}
                        </td>
                        <td className="border border-gray-600 px-2 py-1" colSpan={9}></td>
                      </tr>

                      {/* Division Header if applicable */}
                      {group.division && (
                        <tr className="bg-gray-200 font-semibold">
                          <td className="border border-gray-400 px-2 py-1" colSpan={2}>
                            {group.division}
                          </td>
                          <td className="border border-gray-400 px-2 py-1" colSpan={9}></td>
                        </tr>
                      )}

                      {/* Line Items */}
                      {group.lines.map((line, idx) => {
                        const lineDirectCost = (line.materialCost || 0) + (line.laborCost || 0) + (line.equipmentCost || 0);
                        const lineMarkup = lineDirectCost * 0.25;
                        const lineVAT = (lineDirectCost + lineMarkup) * 0.12;
                        const lineIndirect = lineMarkup + lineVAT;
                        const lineTotal = lineDirectCost + lineIndirect;
                        const unitCost = line.quantity > 0 ? lineTotal / line.quantity : 0;
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-2 py-1 text-center">{line.itemNo || '-'}</td>
                            <td className="border border-gray-300 px-2 py-1">{line.description}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right bg-yellow-50 font-semibold">
                              {line.quantity.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{line.unit}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                              {formatCurrency(lineDirectCost)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">25%</td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                              {formatCurrency(lineMarkup)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                              {formatCurrency(lineVAT)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                              {formatCurrency(lineIndirect)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono font-bold bg-yellow-50">
                              {formatCurrency(lineTotal)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                              {formatCurrency(unitCost)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Part Subtotal */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-gray-400 px-2 py-2" colSpan={4}>
                          TOTAL OF {partKey}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono">
                          {formatCurrency(groupDirectCost)}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-center">25%</td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono">
                          {formatCurrency(groupMarkup)}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono">
                          {formatCurrency(groupVAT)}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono">
                          {formatCurrency(groupIndirect)}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono" colSpan={2}>
                          {formatCurrency(group.subtotal)}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Grand Total */}
                <tr className="bg-gray-700 text-white font-bold text-sm">
                  <td className="border border-gray-600 px-2 py-3" colSpan={9}>
                    GRAND TOTAL
                  </td>
                  <td className="border border-gray-600 px-2 py-3 text-right font-mono" colSpan={2}>
                    {formatCurrency(estimate.grandTotalSubmitted)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="p-4 text-xs text-gray-600 italic border-t">
            **Work items and descriptions are modifiable depending on the pay items involved (i.e., work items under Blue Book Volume II may be included if necessary).
          </div>
        </div>
      )}

      {/* PROGRAM OF WORKS/BUDGET COST */}
      {reportType === 'summary' && (
        <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none">
          {/* DPWH Header */}
          <div className="p-6 border-b-2 border-gray-900">
            <div className="text-center mb-4">
              <div className="text-xs text-gray-600">Republic of the Philippines</div>
              <div className="font-bold">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
              <div className="font-bold text-lg mt-2">PROGRAM OF WORKS/BUDGET COST</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <div><span className="font-semibold">Implementing Office:</span> {estimate.implementingOffice}</div>
                <div><span className="font-semibold">Address:</span> San Victorias St., Malaybalay City, Bukidnon</div>
                <div><span className="font-semibold">Project Name:</span> {estimate.projectName}</div>
              </div>
              <div className="text-right">
                <div><span className="font-semibold">Date Prepared:</span> {new Date(estimate.createdAt).toLocaleDateString()}</div>
                <div><span className="font-semibold">Contract Duration:</span> 100 CD</div>
                <div><span className="font-semibold">No. of Working Days:</span> 69 CD</div>
                <div className="text-xs mt-2">DPWH-QABP-13-13 Rev00</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              <div><span className="font-semibold">Project Location:</span> {estimate.projectLocation}</div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-3 py-3">ITEM NO.</th>
                  <th className="border border-gray-600 px-3 py-3">DESCRIPTION</th>
                  <th className="border border-gray-600 px-3 py-3">ESTIMATED DIRECT COST</th>
                  <th className="border border-gray-600 px-3 py-3">%</th>
                  <th className="border border-gray-600 px-3 py-3">TOTAL MARK-UP VALUE</th>
                  <th className="border border-gray-600 px-3 py-3">VAT</th>
                  <th className="border border-gray-600 px-3 py-3">TOTAL INDIRECT COST</th>
                  <th className="border border-gray-600 px-3 py-3">TOTAL COST</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(grouped).sort().map((partKey) => {
                  const group = grouped[partKey];
                  const groupDirectCost = group.lines.reduce((sum, l) => sum + ((l.materialCost || 0) + (l.laborCost || 0) + (l.equipmentCost || 0)), 0);
                  const groupMarkup = groupDirectCost * 0.25;
                  const groupVAT = (groupDirectCost + groupMarkup) * 0.12;
                  const groupIndirect = groupMarkup + groupVAT;
                  
                  return (
                    <tr key={partKey} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 font-semibold">{partKey}</td>
                      <td className="border border-gray-300 px-3 py-2 font-semibold">
                        {group.partDescription || 'OTHER REQUIREMENTS'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                        {formatCurrency(groupDirectCost)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">25%</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                        {formatCurrency(groupMarkup)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                        {formatCurrency(groupVAT)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-mono">
                        {formatCurrency(groupIndirect)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-mono font-bold">
                        {formatCurrency(group.subtotal)}
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total */}
                <tr className="bg-gray-700 text-white font-bold">
                  <td className="border border-gray-600 px-3 py-3" colSpan={7}>
                    GRAND TOTAL
                  </td>
                  <td className="border border-gray-600 px-3 py-3 text-right font-mono">
                    {formatCurrency(estimate.grandTotalSubmitted)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Breakdown of Expenditures */}
          <div className="p-6 border-t-2">
            <h3 className="font-bold mb-4">Breakdown of Expenditures:</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.keys(grouped).sort().map((partKey) => {
                      const group = grouped[partKey];
                      const percentage = estimate.grandTotalSubmitted > 0 
                        ? ((group.subtotal / estimate.grandTotalSubmitted) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <tr key={partKey} className="border-b">
                          <td className="py-2">{partKey}</td>
                          <td className="py-2 text-right font-semibold">{percentage}%</td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold border-t-2">
                      <td className="py-2">TOTAL</td>
                      <td className="py-2 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-3">Minimum Equipment Requirement:</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Equipment Description</th>
                      <th className="text-center py-1">Capacity</th>
                      <th className="text-center py-1">Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2" colSpan={3}>
                        <em className="text-gray-500">Based on project requirements</em>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="p-6 border-t-2">
            <div className="text-sm font-semibold mb-4">Preparation and Submission:</div>
            <div className="grid grid-cols-4 gap-6 text-center text-sm">
              <div>
                <div className="border-b border-gray-600 mb-1 pb-8"></div>
                <div className="font-semibold">Prepared by:</div>
                <div className="text-xs mt-2">Engineer II</div>
                <div className="text-xs">Planning and Design Section, {estimate.implementingOffice}</div>
              </div>
              <div>
                <div className="border-b border-gray-600 mb-1 pb-8"></div>
                <div className="font-semibold">Checked/Submitted by:</div>
                <div className="text-xs mt-2">Acting Chief</div>
                <div className="text-xs">Planning and Design Section, {estimate.implementingOffice}</div>
              </div>
              <div>
                <div className="border-b border-gray-600 mb-1 pb-8"></div>
                <div className="font-semibold">Recommending Approval:</div>
                <div className="text-xs mt-2">Assistant District Engineer</div>
                <div className="text-xs">{estimate.implementingOffice}</div>
              </div>
              <div>
                <div className="border-b border-gray-600 mb-1 pb-8"></div>
                <div className="font-semibold">Approval:</div>
                <div className="text-xs mt-2">District Engineer</div>
                <div className="text-xs">{estimate.implementingOffice}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED BREAKDOWN REPORT */}
      {reportType === 'breakdown' && (
        <div className="bg-white rounded-lg shadow overflow-hidden print:shadow-none">
          {/* DPWH Header */}
          <div className="p-6 border-b-2 border-gray-900">
            <div className="text-center mb-4">
              <div className="text-xs text-gray-600">Republic of the Philippines</div>
              <div className="font-bold">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
              <div className="font-bold text-lg mt-2">DETAILED BREAKDOWN OF COMPONENT FOR EACH ITEM</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <div><span className="font-semibold">Implementing Office:</span> {estimate.implementingOffice}</div>
                <div><span className="font-semibold">Address:</span> San Victorias St., Malaybalay City, Bukidnon</div>
              </div>
              <div className="text-right text-xs">
                <div>DPWH-QABP-13-14 Rev00</div>
              </div>
            </div>
            <div className="text-sm mt-2">
              <div><span className="font-semibold">Project Name:</span> {estimate.projectName}</div>
              <div><span className="font-semibold">Project Location:</span> {estimate.projectLocation}</div>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-600 px-2 py-2">ITEM NO.</th>
                  <th className="border border-gray-600 px-2 py-2">DESCRIPTION</th>
                  <th className="border border-gray-600 px-2 py-2">%</th>
                  <th className="border border-gray-600 px-2 py-2">QUANTITY</th>
                  <th className="border border-gray-600 px-2 py-2">UNIT</th>
                  <th className="border border-gray-600 px-2 py-2">MATERIAL</th>
                  <th className="border border-gray-600 px-2 py-2">LABOR</th>
                  <th className="border border-gray-600 px-2 py-2">EQUIPMENT</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL</th>
                  <th className="border border-gray-600 px-2 py-2">%</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL MARK-UP VALUE</th>
                  <th className="border border-gray-600 px-2 py-2">VAT</th>
                  <th className="border border-gray-600 px-2 py-2">TOTAL COST</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(grouped).sort().map((partKey) => {
                  const group = grouped[partKey];
                  return (
                    <React.Fragment key={partKey}>
                      {/* Part Header */}
                      <tr className="bg-gray-200 font-bold">
                        <td className="border border-gray-400 px-2 py-1" colSpan={2}>
                          {partKey}
                          {group.partDescription && ` - ${group.partDescription}`}
                        </td>
                        <td className="border border-gray-400 px-2 py-1" colSpan={11}></td>
                      </tr>

                      {/* Division Header if applicable */}
                      {group.division && (
                        <tr className="bg-gray-100 font-semibold">
                          <td className="border border-gray-400 px-2 py-1" colSpan={2}>
                            {group.division}
                          </td>
                          <td className="border border-gray-400 px-2 py-1" colSpan={11}></td>
                        </tr>
                      )}

                      {/* Line Items */}
                      {group.lines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 py-1 text-center">{line.itemNo || '-'}</td>
                          <td className="border border-gray-300 px-2 py-1">{line.description}</td>
                          <td className="border border-gray-300 px-2 py-1 text-center bg-yellow-50">
                            {line.materialPercent ? `${line.materialPercent}%` : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right bg-yellow-50">
                            {line.quantity.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">{line.unit}</td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                            {line.materialCost ? formatCurrency(line.materialCost) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                            {line.laborCost ? formatCurrency(line.laborCost) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                            {line.equipmentCost ? formatCurrency(line.equipmentCost) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono font-semibold">
                            {line.unitRate ? formatCurrency(line.unitRate) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-center">25%</td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                            {line.unitRate ? formatCurrency(line.unitRate * 0.25) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono">
                            {line.unitRate ? formatCurrency(line.unitRate * 0.12) : '-'}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-mono font-bold">
                            {line.totalAmount ? formatCurrency(line.totalAmount) : '-'}
                          </td>
                        </tr>
                      ))}

                      {/* Part Subtotal */}
                      <tr className="bg-gray-100 font-bold">
                        <td className="border border-gray-400 px-2 py-2" colSpan={8}>
                          TOTAL OF {partKey}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-right font-mono" colSpan={5}>
                          {formatCurrency(group.subtotal)}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Grand Total */}
                <tr className="bg-gray-700 text-white font-bold text-sm">
                  <td className="border border-gray-600 px-2 py-3" colSpan={8}>
                    GRAND TOTAL
                  </td>
                  <td className="border border-gray-600 px-2 py-3 text-right font-mono" colSpan={5}>
                    {formatCurrency(estimate.grandTotalSubmitted)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="p-4 text-xs text-gray-600 italic border-t">
            **Work items and descriptions are modifiable depending on the pay items involved (i.e., work items under Blue Book Volume II may be included if necessary).
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="primary"
        >
          🖨️ Print Report
        </button>
        <button
          onClick={() => router.push(`/estimate/${params.id}`)}
          className="secondary"
        >
          ← Back to Estimate
        </button>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 10pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
