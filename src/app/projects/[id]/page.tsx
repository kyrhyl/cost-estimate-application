'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculateIndirectCosts, getEDCBracketDescription } from '@/lib/calc/indirect-costs';

type TabView = 'details' | 'dupa' | 'hauling';

interface Project {
  _id: string;
  projectName: string;
  projectLocation: string;
  district?: string;
  status: string;
  description?: string;
  appropriation?: string;
  distanceFromOffice?: number;
  haulingCostPerKm?: number;
  // DPWH Program of Works fields
  implementingOffice?: string;
  address?: string;
  targetStartDate?: string;
  targetCompletionDate?: string;
  contractDurationCD?: number;
  workingDays?: number;
  unworkableDays?: {
    sundays?: number;
    holidays?: number;
    rainyDays?: number;
  };
  fundSource?: {
    projectId?: string;
    fundingAgreement?: string;
    fundingOrganization?: string;
  };
  physicalTarget?: {
    infraType?: string;
    projectComponentId?: string;
    targetAmount?: number;
    unitOfMeasure?: string;
  };
  projectComponent?: {
    componentId?: string;
    infraId?: string;
    chainage?: {
      start?: string;
      end?: string;
    };
    stationLimits?: {
      start?: string;
      end?: string;
    };
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  allotedAmount?: number;
  estimatedComponentCost?: number;
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
  const [activeTab, setActiveTab] = useState<TabView>('details');
  const [project, setProject] = useState<Project | null>(null);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [templates, setTemplates] = useState<DUPATemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  
  // Hauling calculation state
  const [materialName, setMaterialName] = useState('Sand & Gravel');
  const [materialSource, setMaterialSource] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [freeHaulingDistance, setFreeHaulingDistance] = useState(3);
  const [routeSegments, setRouteSegments] = useState([
    { terrain: 'Flat (Paved)', distanceKm: 0, speedUnloadedKmh: 55, speedLoadedKmh: 35 },
    { terrain: 'Rolling (Paved)', distanceKm: 0, speedUnloadedKmh: 40, speedLoadedKmh: 30 },
    { terrain: 'Mountainous (UnPaved)', distanceKm: 0, speedUnloadedKmh: 25, speedLoadedKmh: 15 },
  ]);
  const [equipmentCapacity, setEquipmentCapacity] = useState(10);
  const [equipmentRentalRate, setEquipmentRentalRate] = useState(1420);
  const [savingHauling, setSavingHauling] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchBOQ();
    fetchTemplates();
  }, [params.id]);

  useEffect(() => {
    if (project) {
      setTotalDistance(project.distanceFromOffice || 0);
      
      // Load saved hauling configuration if it exists
      if ((project as any).haulingConfig) {
        const config = (project as any).haulingConfig;
        if (config.materialName) setMaterialName(config.materialName);
        if (config.materialSource) setMaterialSource(config.materialSource);
        if (config.freeHaulingDistance !== undefined) setFreeHaulingDistance(config.freeHaulingDistance);
        if (config.routeSegments) setRouteSegments(config.routeSegments);
        if (config.equipmentCapacity) setEquipmentCapacity(config.equipmentCapacity);
        if (config.equipmentRentalRate) setEquipmentRentalRate(config.equipmentRentalRate);
      }
    }
  }, [project]);

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
      // Calculate project-level OCM and CP percentages based on current total EDC
      const currentTotalEDC = boqItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const projectPercentages = calculateIndirectCosts(currentTotalEDC);
      
      // Step 1: Instantiate template with project location, hauling cost, and project-level percentages
      const instantiateResponse = await fetch(
        `/api/dupa-templates/${selectedTemplate}/instantiate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: project.projectLocation,
            quantity,
            projectId: params.id, // Pass project ID for hauling cost calculation
            projectOcmPercentage: projectPercentages.ocmPercentage, // Use project-level OCM %
            projectCpPercentage: projectPercentages.contractorsProfitPercentage, // Use project-level CP %
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

  const handleSaveHaulingConfig = async () => {
    setSavingHauling(true);
    try {
      const payload = {
        distanceFromOffice: totalDistance,
        haulingConfig: {
          materialName,
          materialSource,
          totalDistance,
          freeHaulingDistance,
          routeSegments,
          equipmentCapacity,
          equipmentRentalRate,
        },
      };
      
      console.log('Saving hauling config:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Save response:', result);
      
      if (result.success) {
        await fetchProject();
        
        // Automatically recalculate all BOQ items with new hauling costs
        if (boqItems.length > 0) {
          const recalcResult = await recalculateAllBOQItems();
          if (recalcResult.success) {
            alert(`✅ Hauling configuration saved!\n\n📊 Auto-recalculated ${recalcResult.successCount} BOQ item(s) with new hauling costs.`);
          } else {
            alert(`✅ Hauling configuration saved!\n\n⚠️ ${recalcResult.successCount} BOQ items recalculated, ${recalcResult.failCount} failed.`);
          }
        } else {
          alert('✅ Hauling configuration saved successfully!');
        }
      } else {
        console.error('Save failed:', result);
        alert('Failed to save hauling configuration: ' + (result.error || 'Unknown error') + 
              (result.details ? '\n\nDetails: ' + JSON.stringify(result.details) : ''));
      }
    } catch (error) {
      console.error('Failed to save hauling config:', error);
      alert('Failed to save hauling configuration');
    } finally {
      setSavingHauling(false);
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

  // Internal function for recalculating (without UI prompts)
  const recalculateAllBOQItems = async () => {
    let successCount = 0;
    let failCount = 0;

    try {
      // Calculate project-level OCM and CP percentages based on total EDC
      const projectPercentages = calculateIndirectCosts(totalDirectCost);
      
      for (const item of boqItems) {
        try {
          // Re-instantiate the template with current rates and project-level percentages
          const instantiateResponse = await fetch(`/api/dupa-templates/${(item as any).templateId._id || (item as any).templateId}/instantiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: project?.projectLocation || 'Cabangasan',
              projectId: params.id,
              projectOcmPercentage: projectPercentages.ocmPercentage, // Use project-level OCM %
              projectCpPercentage: projectPercentages.contractorsProfitPercentage, // Use project-level CP %
            }),
          });

          const instantiateResult = await instantiateResponse.json();

          if (instantiateResult.success) {
            // Update the existing BOQ item with new calculated values
            const updateResponse = await fetch(`/api/project-boq/${(item as any)._id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...instantiateResult.data,
                quantity: item.quantity, // Preserve user's quantity
              }),
            });

            const updateResult = await updateResponse.json();
            if (updateResult.success) {
              successCount++;
            } else {
              failCount++;
              console.error('Failed to update BOQ item:', item, updateResult.error);
            }
          } else {
            failCount++;
            console.error('Failed to instantiate template for:', item, instantiateResult.error);
          }
        } catch (error) {
          failCount++;
          console.error('Error recalculating BOQ item:', item, error);
        }
      }

      if (successCount > 0) {
        await fetchBOQ();
      }

      return { success: failCount === 0, successCount, failCount };
    } catch (error) {
      console.error('Recalculation error:', error);
      return { success: false, successCount, failCount };
    }
  };

  const handleRecalculateAllBOQ = async () => {
    if (!boqItems.length) {
      alert('No BOQ items to recalculate');
      return;
    }

    if (!confirm(`Recalculate ${boqItems.length} BOQ item(s) with current rates?\n\nThis will update:\n- Labor rates\n- Equipment rates\n- Material prices\n- Hauling costs\n\nExisting costs will be replaced with current values.`)) {
      return;
    }

    setRecalculating(true);
    try {
      const result = await recalculateAllBOQItems();
      
      if (result.failCount === 0) {
        alert(`✅ Successfully recalculated ${result.successCount} BOQ item(s)!`);
      } else {
        alert(`⚠️ Recalculation completed:\n✅ ${result.successCount} succeeded\n❌ ${result.failCount} failed`);
      }
    } finally {
      setRecalculating(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  const totalDirectCost = boqItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const indirectCosts = calculateIndirectCosts(totalDirectCost);
  
  // Calculate breakdown of costs from BOQ items
  const laborTotal = boqItems.reduce((sum, item: any) => {
    const laborCost = (item.laborItems || []).reduce((lsum: number, l: any) => lsum + (l.amount || 0), 0);
    return sum + (laborCost * (item.quantity || 1));
  }, 0);
  
  const materialTotal = boqItems.reduce((sum, item: any) => {
    const materialCost = (item.materialItems || []).reduce((msum: number, m: any) => msum + (m.amount || 0), 0);
    return sum + (materialCost * (item.quantity || 1));
  }, 0);
  
  const equipmentTotal = boqItems.reduce((sum, item: any) => {
    const equipmentCost = (item.equipmentItems || []).reduce((esum: number, e: any) => esum + (e.amount || 0), 0);
    return sum + (equipmentCost * (item.quantity || 1));
  }, 0);
  
  const ocmAndCp = indirectCosts.ocmAmount + indirectCosts.contractorsProfitAmount;
  const vat = (totalDirectCost + ocmAndCp) * 0.12;
  const totalConstructionCost = totalDirectCost + ocmAndCp + vat;
  const eaoPercentage = 1;
  const eaoAmount = project.allotedAmount ? project.allotedAmount * (eaoPercentage / 100) : 0;
  const totalEstimatedCost = totalConstructionCost + eaoAmount;

  return (
    <div className="container mx-auto p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex justify-between items-center border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveTab('dupa')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dupa'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              DUPA / BOQ
            </button>
            <button
              onClick={() => setActiveTab('hauling')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hauling'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hauling Distance
            </button>
          </nav>
          <button
            onClick={() => router.push('/projects')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          >
            ← Back to Projects
          </button>
        </div>
      </div>

      {/* Project Details Tab - DPWH Program of Works Format */}
      {activeTab === 'details' && (
        <div className="bg-white shadow rounded-lg p-3">
          {/* 3×3 Grid Structure */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 mb-2 text-xs">
            
            {/* ROW 1, COL 1: General Project Details */}
            <div className="border border-black p-2 space-y-1 row-span-1">
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="font-semibold">Implementing Office:</span>
                <span className="border-b border-black px-1">{project.implementingOffice || 'DPWH Bukidnon 1st District Engineering Office'}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="font-semibold">Address:</span>
                <span className="border-b border-black px-1">{project.address || 'San Victores St., Malaybalay City, Bukidnon'}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="font-semibold">Project Name:</span>
                <div className="space-y-0.5">
                  <div className="border-b border-black px-1">{project.projectName}</div>
                  <div className="border-b border-black px-1">{project.projectLocation}</div>
                </div>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="font-semibold">Project Location:</span>
                <span className="border-b border-black px-1">{project.projectLocation}</span>
              </div>
            </div>

            {/* ROW 1, COL 2: Date Details */}
            <div className="border border-black p-2 space-y-1">
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="font-semibold whitespace-nowrap text-[11px]">Date Prepared:</span>
                <span className="border-b border-black px-1 text-right text-[11px]">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="font-semibold whitespace-nowrap text-[11px]">Target Start Date:</span>
                <span className="border-b border-black px-1 text-right text-[11px]">{project.targetStartDate ? new Date(project.targetStartDate).toLocaleDateString() : 'January 15, 2026'}</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="font-semibold whitespace-nowrap text-[11px]">Target Completion Date:</span>
                <span className="border-b border-black px-1 text-right text-[11px]">{project.targetCompletionDate ? new Date(project.targetCompletionDate).toLocaleDateString() : 'April 01, 2026'}</span>
              </div>
            </div>

            {/* ROW 1, COL 3: Contract Duration */}
            <div className="border border-black p-2 space-y-1">
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="font-semibold whitespace-nowrap text-[11px]">Contract Duration:</span>
                <span className="border-b border-black px-1 text-right text-[11px]">{project.contractDurationCD || '200.00'} CD</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-1">
                <span className="font-semibold whitespace-nowrap text-[11px]">No. of Workable Days:</span>
                <span className="border-b border-black px-1 text-right text-[11px]">{project.workingDays || '127'} CD</span>
              </div>
              <div>
                <div className="font-semibold mb-0.5 text-[10px]">No. of Predetermined Unworkable Days:</div>
                <div className="ml-3 space-y-0.5 text-[10px]">
                  <div className="grid grid-cols-[1fr_auto] gap-1">
                    <span>a. Sundays:</span>
                    <span className="border-b border-black w-16 text-right px-1">{project.unworkableDays?.sundays || '27'} CD</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-1">
                    <span>b. Holidays:</span>
                    <span className="border-b border-black w-16 text-right px-1">{project.unworkableDays?.holidays || '8'} CD</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-1">
                    <span>c. Rainy Days:</span>
                    <span className="border-b border-black w-16 text-right px-1">{project.unworkableDays?.rainyDays || '36'} CD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2, COL 1: Work Location */}
            <div className="border border-black p-2">
              <div className="grid grid-cols-[auto_1fr] gap-2">
                <span className="font-semibold whitespace-nowrap">Work Location:</span>
                <span className="border-b border-black px-1">{project.district || ''}</span>
              </div>
              <table className="w-full border-collapse border border-black text-[10px] mt-2">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-1 py-1 text-center font-semibold" rowSpan={2}>Project Component ID</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold" rowSpan={2}>Infra ID</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold" colSpan={2}>Chainage</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold" colSpan={2}>Station Limits</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold" colSpan={2}>Coordinates</th>
                  </tr>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-1 py-1 text-center font-semibold">Start<br/>X</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold">End<br/>Y</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold">Start<br/>X</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold">End<br/>Y</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold">Latitude</th>
                    <th className="border border-black px-1 py-1 text-center font-semibold">Longitude</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border border-black px-1 py-2">{project.projectComponent?.componentId || ''}</td>
                    <td className="border border-black px-1 py-2">{project.projectComponent?.infraId || ''}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.chainage?.start || 'X'}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.chainage?.end || 'Y'}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.stationLimits?.start || 'X'}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.stationLimits?.end || 'Y'}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.coordinates?.latitude || ''}</td>
                    <td className="border border-black px-1 py-2 text-center">{project.projectComponent?.coordinates?.longitude || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ROW 2, COL 2-3: Funding Source (spans 2 columns) */}
            <div className="border border-black p-2 col-span-2">
              <div className="font-semibold mb-1">Fund Source:</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-2 py-1 text-center font-semibold">Project ID</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Funding Agreement</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Funding Organization</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border border-black px-2 py-2">{project.fundSource?.projectId || ''}</td>
                    <td className="border border-black px-2 py-2">{project.fundSource?.fundingAgreement || 'FY 2025 BEFF - BATCH 1'}</td>
                    <td className="border border-black px-2 py-2">{project.fundSource?.fundingOrganization || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ROW 3, COL 1: Allotted Amount */}
            <div className="border border-black p-2">
              <div className="font-semibold mb-1">Allotted Amount:</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-2 py-1 text-center font-semibold">Project Component ID</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Estimated Project Component Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border border-black px-2 py-2">{project.physicalTarget?.projectComponentId || 'CW1'}</td>
                    <td className="border border-black px-2 py-2 text-right font-medium">
                      {(project.estimatedComponentCost || 20100000).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ROW 3, COL 2-3: Physical Target (spans 2 columns) */}
            <div className="border border-black p-2 col-span-2">
              <div className="font-semibold mb-1">Physical Target:</div>
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-2 py-1 text-center font-semibold">Infra Type</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Project Component ID</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Target Amount</th>
                    <th className="border border-black px-2 py-1 text-center font-semibold">Unit of Measure</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="border border-black px-2 py-2">{project.physicalTarget?.infraType || 'Local'}</td>
                    <td className="border border-black px-2 py-2">{project.physicalTarget?.projectComponentId || 'CW1'}</td>
                    <td className="border border-black px-2 py-2 text-center">{project.physicalTarget?.targetAmount || '1'}</td>
                    <td className="border border-black px-2 py-2">{project.physicalTarget?.unitOfMeasure || 'No. of Storey'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Description of Works to be Done */}
          <div className="mt-4 mb-3">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="border border-black px-2 py-2 text-center" colSpan={3}>Description of Works to be Done</th>
                  <th className="border border-black px-2 py-2 text-center">Quantity</th>
                  <th className="border border-black px-2 py-2 text-center">Unit</th>
                  <th className="border border-black px-2 py-2 text-center" colSpan={2}>As Submitted</th>
                  <th className="border border-black px-2 py-2 text-center" colSpan={2}>As Evaluated</th>
                </tr>
                <tr className="bg-slate-700 text-white">
                  <th className="border border-black px-2 py-1 text-center" colSpan={3}></th>
                  <th className="border border-black px-2 py-1 text-center"></th>
                  <th className="border border-black px-2 py-1 text-center"></th>
                  <th className="border border-black px-2 py-1 text-center">% Total</th>
                  <th className="border border-black px-2 py-1 text-center">Total Direct Cost</th>
                  <th className="border border-black px-2 py-1 text-center">% Total</th>
                  <th className="border border-black px-2 py-1 text-center">Total Direct Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1">PART B</td>
                  <td className="border border-black px-2 py-1" colSpan={2}>OTHER GENERAL REQUIREMENTS</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">11%</td>
                  <td className="border border-black px-2 py-1 text-right">144,384.19</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-black px-2 py-1">DIVISION I</td>
                  <td className="border border-black px-2 py-1" colSpan={2}>GENERAL</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART C</td>
                  <td className="border border-black px-2 py-1">EARTHWORK</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">1%</td>
                  <td className="border border-black px-2 py-1 text-right">6,549.73</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART D</td>
                  <td className="border border-black px-2 py-1">REINFORCED CONCRETE</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">1%</td>
                  <td className="border border-black px-2 py-1 text-right">18,194.90</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-black px-2 py-1">DIVISION II</td>
                  <td className="border border-black px-2 py-1" colSpan={2}>BUILDINGS</td>
                  <td className="border border-black px-2 py-1">(SEE FORM DPWH-QMSP-13-11 Rev00)</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART E</td>
                  <td className="border border-black px-2 py-1">FINISHINGS AND OTHER CIVIL WORKS</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">63%</td>
                  <td className="border border-black px-2 py-1 text-right">787,962.83</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART F</td>
                  <td className="border border-black px-2 py-1">ELECTRICAL</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">5%</td>
                  <td className="border border-black px-2 py-1 text-right">69,189.25</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART G</td>
                  <td className="border border-black px-2 py-1">MECHANICAL</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">19%</td>
                  <td className="border border-black px-2 py-1 text-right">234,069.22</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1">PART L</td>
                  <td className="border border-black px-2 py-1">FLOOD AND RIVER CONTROL AND DRAINAGE</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1 text-right">87%</td>
                  <td className="border border-black px-2 py-1 text-right">1,091,221.10</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
                <tr className="font-semibold bg-gray-100">
                  <td className="border border-black px-2 py-1" colSpan={4}></td>
                  <td className="border border-black px-2 py-1 text-center">TOTAL:</td>
                  <td className="border border-black px-2 py-1 text-right">100%</td>
                  <td className="border border-black px-2 py-1 text-right">1,260,349.92</td>
                  <td className="border border-black px-2 py-1"></td>
                  <td className="border border-black px-2 py-1"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Two Column Layout: Equipment and Expenditures */}
          <div className="grid grid-cols-2 gap-2 mt-4 mb-3 items-start">
            {/* Left Column: Minimum Equipment Requirement */}
            <div className="flex flex-col h-full">
              <div className="font-semibold text-[10px] mb-1">Minimum Equipment Requirement:</div>
              <table className="w-full border-collapse text-[10px] flex-1">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-2 py-1.5">Equipment Description</th>
                    <th className="border border-black px-2 py-1.5 text-center">Capacity</th>
                    <th className="border border-black px-2 py-1.5 text-center">Number of Equipment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">(SEE FORM DPWH-QMSP-13-12 Rev00)</td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 h-6"></td>
                    <td className="border border-black px-2 py-1"></td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right Column: Breakdown of Expenditures */}
            <div className="flex flex-col h-full">
              <div className="font-semibold text-[10px] mb-1">Breakdown of Expenditures:</div>
              <table className="w-full border-collapse text-[10px] flex-1">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="border border-black px-2 py-1.5 w-8 text-center"></th>
                    <th className="border border-black px-2 py-1.5">Description</th>
                    <th className="border border-black px-2 py-1.5 text-center">As Submitted</th>
                    <th className="border border-black px-2 py-1.5 text-center">As Evaluated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">A</td>
                    <td className="border border-black px-2 py-1">Labor</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {laborTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">B</td>
                    <td className="border border-black px-2 py-1">Materials</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {materialTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">C</td>
                    <td className="border border-black px-2 py-1">Equipment</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {equipmentTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">D</td>
                    <td className="border border-black px-2 py-1">Total Direct Cost (A+B+C)</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {totalDirectCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">E</td>
                    <td className="border border-black px-2 py-1">Overhead, Contingencies and Miscellaneous (OCM) Expenses and Contractor's Profit (CP)</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {ocmAndCp.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">F</td>
                    <td className="border border-black px-2 py-1">Value Added Tax (VAT)</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {vat.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">G</td>
                    <td className="border border-black px-2 py-1">Total Construction Cost (D+E+F)</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {totalConstructionCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr>
                    <td className="border border-black px-2 py-1 text-center">H</td>
                    <td className="border border-black px-2 py-1">Engineering & Administrative Overhead (EAO).</td>
                    <td className="border border-black px-2 py-1 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{eaoPercentage}</span>
                        <span className="px-1">%</span>
                        <span>{eaoAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                  <tr className="font-semibold bg-gray-100">
                    <td className="border border-black px-2 py-1 text-center">I</td>
                    <td className="border border-black px-2 py-1">TOTAL ESTIMATED COST</td>
                    <td className="border border-black px-2 py-1 text-right">
                      {totalEstimatedCost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push(`/projects/${params.id}/edit`)}
              className="bg-indigo-600 text-white px-4 py-1.5 text-xs rounded hover:bg-indigo-700"
            >
              Edit Project Details
            </button>
            <button
              onClick={() => window.print()}
              className="bg-green-600 text-white px-4 py-1.5 text-xs rounded hover:bg-green-700"
            >
              Print Program of Works
            </button>
          </div>
        </div>
      )}

      {/* DUPA/BOQ Tab */}
      {activeTab === 'dupa' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Bill of Quantities</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRecalculateAllBOQ}
                disabled={recalculating || boqItems.length === 0}
                className={`px-6 py-2 rounded flex items-center gap-2 ${
                  recalculating || boqItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Recalculate all BOQ items with current labor/equipment/material/hauling rates"
              >
                {recalculating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recalculating...
                  </>
                ) : (
                  <>
                    🔄 Recalculate All BOQ
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                + Add BOQ Item
              </button>
            </div>
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

          {/* Cost Summary with Indirect Costs */}
          {boqItems.length > 0 && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Project Cost Summary</h3>
              <div className="text-sm mb-2 text-gray-600">
                EDC Bracket: <span className="font-semibold">{getEDCBracketDescription(totalDirectCost)}</span>
              </div>
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-center w-32">Percentage</th>
                    <th className="border border-gray-300 px-4 py-2 text-right w-48">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Estimated Direct Cost (EDC)</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">—</td>
                    <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-blue-600">
                      ₱{indirectCosts.estimatedDirectCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-2">OCM (Overhead, Contingencies, Miscellaneous)</td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{indirectCosts.ocmPercentage}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₱{indirectCosts.ocmAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-2">Contractor's Profit (CP)</td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{indirectCosts.contractorsProfitPercentage}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₱{indirectCosts.contractorsProfitAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-yellow-50 font-semibold">
                    <td className="border border-gray-300 px-4 py-2">Total Indirect Cost</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{indirectCosts.totalIndirectCostPercentage}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₱{indirectCosts.totalIndirectCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-purple-100 font-bold text-lg">
                    <td className="border border-gray-300 px-4 py-3">TOTAL PROJECT COST</td>
                    <td className="border border-gray-300 px-4 py-3 text-center">—</td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-purple-700">
                      ₱{indirectCosts.totalProjectCost.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="text-xs text-gray-500 mt-3">
                <strong>Note:</strong> Indirect cost percentages are based on DPWH Standard Guidelines:<br/>
                • Up to ₱5M: OCM 15%, CP 10%<br/>
                • ₱5M-₱50M: OCM 12%, CP 8%<br/>
                • ₱50M-₱150M: OCM 10%, CP 8%<br/>
                • Above ₱150M: OCM 8%, CP 8%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hauling Distance Tab */}
      {activeTab === 'hauling' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">DPWH Hauling Cost Computation - Aggregates</h2>
          <p className="text-gray-600 mb-6">
            Configure hauling cost calculation based on DPWH standards. This matches the official DPWH computation form for aggregates.
          </p>

          {/* Material Information */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Material Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Sand & Gravel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Source</label>
                <input
                  type="text"
                  value={materialSource}
                  onChange={(e) => setMaterialSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Putangi River Quarry, Boac, Nabuos"
                />
              </div>
            </div>
          </div>

          {/* Distance Configuration */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Distance Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Hauling Distance (km)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalDistance}
                  onChange={(e) => setTotalDistance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 25.10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Hauling (First km)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeHaulingDistance}
                  onChange={(e) => setFreeHaulingDistance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 3.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chargeable Distance (km)</label>
                <input
                  type="number"
                  value={(totalDistance - freeHaulingDistance).toFixed(2)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Route Segments */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Route Breakdown by Terrain</h3>
            <div className="space-y-4">
              {routeSegments.map((segment, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {segment.terrain}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={segment.distanceKm}
                      onChange={(e) => {
                        const newSegments = [...routeSegments];
                        newSegments[index].distanceKm = parseFloat(e.target.value) || 0;
                        setRouteSegments(newSegments);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Distance (km)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Speed Unloaded (km/hr)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={segment.speedUnloadedKmh}
                      onChange={(e) => {
                        const newSegments = [...routeSegments];
                        newSegments[index].speedUnloadedKmh = parseFloat(e.target.value) || 0;
                        setRouteSegments(newSegments);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Speed Loaded (km/hr)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={segment.speedLoadedKmh}
                      onChange={(e) => {
                        const newSegments = [...routeSegments];
                        newSegments[index].speedLoadedKmh = parseFloat(e.target.value) || 0;
                        setRouteSegments(newSegments);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Time: {(segment.distanceKm / segment.speedUnloadedKmh || 0).toFixed(4)} hr (unloaded)<br/>
                      {(segment.distanceKm / segment.speedLoadedKmh || 0).toFixed(4)} hr (loaded)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Configuration */}
          <div className="mb-6 border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Dump Truck Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (cu.m. of Aggregates)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={equipmentCapacity}
                  onChange={(e) => setEquipmentCapacity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rental Rate per Hour (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={equipmentRentalRate}
                  onChange={(e) => setEquipmentRentalRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 1420.00"
                />
              </div>
            </div>
          </div>

          {/* Calculation Results */}
          {(() => {
            const timeUnloaded = routeSegments.reduce((sum, seg) => sum + (seg.distanceKm / seg.speedUnloadedKmh || 0), 0);
            const timeLoaded = routeSegments.reduce((sum, seg) => sum + (seg.distanceKm / seg.speedLoadedKmh || 0), 0);
            const delayAllowance = (timeUnloaded + timeLoaded) * 0.10;
            const maneuverAllowance = 0.25;
            const totalCycleTime = timeUnloaded + timeLoaded + delayAllowance + maneuverAllowance;
            const costPerTrip = totalCycleTime * equipmentRentalRate;
            const costPerCuM = equipmentCapacity > 0 ? costPerTrip / equipmentCapacity : 0;

            return (
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-900 mb-4 text-lg">DPWH Hauling Cost Computation Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 mb-2">CYCLE TIME</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>A. Without Load (where distance/velocity):</strong></p>
                      {routeSegments.map((seg, idx) => (
                        <p key={`a-${idx}`} className="ml-4">
                          {seg.terrain}: {(seg.distanceKm / seg.speedUnloadedKmh || 0).toFixed(4)} hr
                        </p>
                      ))}
                      <p className="font-semibold ml-4">Total Time A = {timeUnloaded.toFixed(3)} hr</p>
                      
                      <p className="mt-3"><strong>B. With Load (where distance/velocity):</strong></p>
                      {routeSegments.map((seg, idx) => (
                        <p key={`b-${idx}`} className="ml-4">
                          {seg.terrain}: {(seg.distanceKm / seg.speedLoadedKmh || 0).toFixed(4)} hr
                        </p>
                      ))}
                      <p className="font-semibold ml-4">Total Time B = {timeLoaded.toFixed(3)} hr</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm space-y-1">
                      <p><strong>C. Allowance for Delay:</strong></p>
                      <p className="ml-4">(A + B) × 10.00% = {delayAllowance.toFixed(3)} hr</p>
                      
                      <p className="mt-2"><strong>D. Allowance for Maneuver:</strong></p>
                      <p className="ml-4">{maneuverAllowance.toFixed(3)} hr (15.00 min)</p>
                      
                      <p className="mt-2"><strong>E. Total Cycle Time:</strong></p>
                      <p className="ml-4 font-semibold">A + B + C + D = {totalCycleTime.toFixed(4)} hr</p>
                      
                      <div className="mt-4 pt-4 border-t border-blue-300">
                        <p><strong>Using Dump Truck:</strong></p>
                        <p className="ml-4">Capacity: {equipmentCapacity} cu.m. of Aggregates</p>
                        <p className="ml-4">Rental Rate: ₱{equipmentRentalRate.toFixed(2)} per hour</p>
                        
                        <p className="mt-3"><strong>Cost per Trip:</strong></p>
                        <p className="ml-4">{totalCycleTime.toFixed(4)} × ₱{equipmentRentalRate.toFixed(2)} = ₱{costPerTrip.toFixed(2)}</p>
                        
                        <p className="mt-3 text-lg"><strong>HAULING COST PER CU.M.:</strong></p>
                        <p className="ml-4 text-2xl font-bold text-blue-900">₱{costPerCuM.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-blue-700 mt-4 pt-4 border-t border-blue-300">
                  <strong>Note:</strong> This hauling cost per cu.m. will be automatically added to material prices
                  when you instantiate DUPA templates for this project's BOQ.
                </p>
              </div>
            );
          })()}

          <div className="flex gap-3">
            <button
              onClick={handleSaveHaulingConfig}
              disabled={savingHauling}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {savingHauling ? 'Saving...' : 'Save Hauling Configuration'}
            </button>
            <button
              onClick={() => {
                setTotalDistance(project?.distanceFromOffice || 0);
                setFreeHaulingDistance(3);
                setMaterialName('Sand & Gravel');
                setMaterialSource('');
                setRouteSegments([
                  { terrain: 'Flat (Paved)', distanceKm: 0, speedUnloadedKmh: 55, speedLoadedKmh: 35 },
                  { terrain: 'Rolling (Paved)', distanceKm: 0, speedUnloadedKmh: 40, speedLoadedKmh: 30 },
                  { terrain: 'Mountainous (UnPaved)', distanceKm: 0, speedUnloadedKmh: 25, speedLoadedKmh: 15 },
                ]);
                setEquipmentCapacity(10);
                setEquipmentRentalRate(1420);
              }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

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
                  <strong>{project?.projectLocation}</strong>. Labor rates, equipment rates, and 
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
