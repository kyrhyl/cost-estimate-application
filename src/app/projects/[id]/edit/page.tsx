'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['Planning', 'Approved', 'Ongoing', 'Completed', 'Cancelled'];
const PROJECT_TYPES = [
  'Road Construction',
  'Bridge Construction',
  'Building Construction',
  'Flood Control',
  'Drainage System',
  'Other Infrastructure'
];

interface LaborRate {
  _id: string;
  location: string;
  district?: string;
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LaborRate[]>([]);

  // Basic fields
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [district, setDistrict] = useState('Bukidnon 1st District');
  const [implementingOffice, setImplementingOffice] = useState('DPWH Bukidnon 1st District Engineering Office');
  const [appropriation, setAppropriation] = useState('');
  const [contractId, setContractId] = useState('');
  const [projectType, setProjectType] = useState('Road Construction');
  const [status, setStatus] = useState('Planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [haulingCostPerKm, setHaulingCostPerKm] = useState(0);
  const [distanceFromOffice, setDistanceFromOffice] = useState(0);

  // DPWH Program of Works fields
  const [address, setAddress] = useState('San Victores St., Malaybalay City, Bukidnon');
  const [targetStartDate, setTargetStartDate] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [contractDurationCD, setContractDurationCD] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [sundays, setSundays] = useState(0);
  const [holidays, setHolidays] = useState(0);
  const [rainyDays, setRainyDays] = useState(0);
  
  // Fund Source
  const [fundProjectId, setFundProjectId] = useState('');
  const [fundingAgreement, setFundingAgreement] = useState('General Appropriation Act (GAA 2026)');
  const [fundingOrganization, setFundingOrganization] = useState('');

  // Physical Target
  const [infraType, setInfraType] = useState('Local');
  const [projectComponentId, setProjectComponentId] = useState('CW1');
  const [targetAmount, setTargetAmount] = useState(1);
  const [unitOfMeasure, setUnitOfMeasure] = useState('No. of Storey');

  // Project Component
  const [componentId, setComponentId] = useState('');
  const [infraId, setInfraId] = useState('');
  const [chainageStart, setChainageStart] = useState('');
  const [chainageEnd, setChainageEnd] = useState('');
  const [stationStart, setStationStart] = useState('');
  const [stationEnd, setStationEnd] = useState('');
  const [latitude, setLatitude] = useState(8.13095);
  const [longitude, setLongitude] = useState(125.12941);

  const [allotedAmount, setAllotedAmount] = useState(0);
  const [estimatedComponentCost, setEstimatedComponentCost] = useState(0);

  useEffect(() => {
    fetchProject();
    fetchLocations();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      const result = await response.json();
      if (result.success) {
        const project = result.data;
        setProjectName(project.projectName || '');
        setProjectLocation(project.projectLocation || '');
        setDistrict(project.district || 'Bukidnon 1st District');
        setImplementingOffice(project.implementingOffice || 'DPWH Bukidnon 1st District Engineering Office');
        setAppropriation(project.appropriation || '');
        setContractId(project.contractId || '');
        setProjectType(project.projectType || 'Road Construction');
        setStatus(project.status || 'Planning');
        setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
        setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
        setDescription(project.description || '');
        setHaulingCostPerKm(project.haulingCostPerKm || 0);
        setDistanceFromOffice(project.distanceFromOffice || 0);

        // DPWH fields
        setAddress(project.address || 'San Victores St., Malaybalay City, Bukidnon');
        setTargetStartDate(project.targetStartDate ? project.targetStartDate.split('T')[0] : '');
        setTargetCompletionDate(project.targetCompletionDate ? project.targetCompletionDate.split('T')[0] : '');
        setContractDurationCD(project.contractDurationCD || 0);
        setWorkingDays(project.workingDays || 0);
        setSundays(project.unworkableDays?.sundays || 0);
        setHolidays(project.unworkableDays?.holidays || 0);
        setRainyDays(project.unworkableDays?.rainyDays || 0);
        
        setFundProjectId(project.fundSource?.projectId || '');
        setFundingAgreement(project.fundSource?.fundingAgreement || 'General Appropriation Act (GAA 2026)');
        setFundingOrganization(project.fundSource?.fundingOrganization || '');

        setInfraType(project.physicalTarget?.infraType || 'Local');
        setProjectComponentId(project.physicalTarget?.projectComponentId || 'CW1');
        setTargetAmount(project.physicalTarget?.targetAmount || 1);
        setUnitOfMeasure(project.physicalTarget?.unitOfMeasure || 'No. of Storey');

        setComponentId(project.projectComponent?.componentId || '');
        setInfraId(project.projectComponent?.infraId || '');
        setChainageStart(project.projectComponent?.chainage?.start || '');
        setChainageEnd(project.projectComponent?.chainage?.end || '');
        setStationStart(project.projectComponent?.stationLimits?.start || '');
        setStationEnd(project.projectComponent?.stationLimits?.end || '');
        setLatitude(project.projectComponent?.coordinates?.latitude || 8.13095);
        setLongitude(project.projectComponent?.coordinates?.longitude || 125.12941);

        setAllotedAmount(project.allotedAmount || 0);
        setEstimatedComponentCost(project.estimatedComponentCost || 0);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/master/labor');
      const result = await response.json();
      if (result.success) {
        setLocations(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const projectData = {
      projectName,
      projectLocation,
      district,
      implementingOffice,
      appropriation,
      contractId,
      projectType,
      status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      description,
      haulingCostPerKm,
      distanceFromOffice,
      address,
      targetStartDate: targetStartDate || undefined,
      targetCompletionDate: targetCompletionDate || undefined,
      contractDurationCD,
      workingDays,
      unworkableDays: {
        sundays,
        holidays,
        rainyDays,
      },
      fundSource: {
        projectId: fundProjectId,
        fundingAgreement,
        fundingOrganization,
      },
      physicalTarget: {
        infraType,
        projectComponentId,
        targetAmount,
        unitOfMeasure,
      },
      projectComponent: {
        componentId,
        infraId,
        chainage: {
          start: chainageStart,
          end: chainageEnd,
        },
        stationLimits: {
          start: stationStart,
          end: stationEnd,
        },
        coordinates: {
          latitude,
          longitude,
        },
      },
      allotedAmount,
      estimatedComponentCost,
    };

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/projects/${params.id}`);
      } else {
        alert('Failed to update project: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Location <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc.location}>
                      {loc.location} {loc.district && `(${loc.district})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Implementing Office
                </label>
                <input
                  type="text"
                  value={implementingOffice}
                  onChange={(e) => setImplementingOffice(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appropriation
                </label>
                <input
                  type="text"
                  value={appropriation}
                  onChange={(e) => setAppropriation(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract ID
                </label>
                <input
                  type="text"
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance from Office (km)
                </label>
                <input
                  type="number"
                  value={distanceFromOffice}
                  onChange={(e) => setDistanceFromOffice(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Contract Duration & Dates */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Contract Duration & Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Start Date
                </label>
                <input
                  type="date"
                  value={targetStartDate}
                  onChange={(e) => setTargetStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetCompletionDate}
                  onChange={(e) => setTargetCompletionDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Duration (CD)
                </label>
                <input
                  type="number"
                  value={contractDurationCD}
                  onChange={(e) => setContractDurationCD(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Days (CD)
                </label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sundays (CD)
                </label>
                <input
                  type="number"
                  value={sundays}
                  onChange={(e) => setSundays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holidays (CD)
                </label>
                <input
                  type="number"
                  value={holidays}
                  onChange={(e) => setHolidays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rainy Days (CD)
                </label>
                <input
                  type="number"
                  value={rainyDays}
                  onChange={(e) => setRainyDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Fund Source */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Fund Source</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={fundProjectId}
                  onChange={(e) => setFundProjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funding Agreement
                </label>
                <input
                  type="text"
                  value={fundingAgreement}
                  onChange={(e) => setFundingAgreement(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funding Organization
                </label>
                <input
                  type="text"
                  value={fundingOrganization}
                  onChange={(e) => setFundingOrganization(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Physical Target */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Physical Target</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Infra Type
                </label>
                <input
                  type="text"
                  value={infraType}
                  onChange={(e) => setInfraType(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Component ID
                </label>
                <input
                  type="text"
                  value={projectComponentId}
                  onChange={(e) => setProjectComponentId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Project Component */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Project Component Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component ID
                </label>
                <input
                  type="text"
                  value={componentId}
                  onChange={(e) => setComponentId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Infra ID
                </label>
                <input
                  type="text"
                  value={infraId}
                  onChange={(e) => setInfraId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chainage Start
                </label>
                <input
                  type="text"
                  value={chainageStart}
                  onChange={(e) => setChainageStart(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chainage End
                </label>
                <input
                  type="text"
                  value={chainageEnd}
                  onChange={(e) => setChainageEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station Start
                </label>
                <input
                  type="text"
                  value={stationStart}
                  onChange={(e) => setStationStart(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station End
                </label>
                <input
                  type="text"
                  value={stationEnd}
                  onChange={(e) => setStationEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  step="0.00001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  step="0.00001"
                />
              </div>
            </div>
          </div>

          {/* Cost Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Cost Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allotted Amount (₱)
                </label>
                <input
                  type="number"
                  value={allotedAmount}
                  onChange={(e) => setAllotedAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Component Cost (₱)
                </label>
                <input
                  type="number"
                  value={estimatedComponentCost}
                  onChange={(e) => setEstimatedComponentCost(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Project description..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/projects/${params.id}`)}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
