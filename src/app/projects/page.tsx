'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  projectName: string;
  projectLocation: string;
  district?: string;
  implementingOffice?: string;
  appropriation?: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

const STATUS_COLORS = {
  Planning: 'bg-blue-100 text-blue-800',
  Approved: 'bg-green-100 text-green-800',
  Ongoing: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === statusFilter);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated BOQ items.')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchProjects();
      } else {
        alert('Failed to delete project: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Projects</h1>
        <p className="text-gray-600">Manage construction projects with location-based BOQ</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Projects
          </button>
          {Object.keys(STATUS_COLORS).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={() => router.push('/projects/new')}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          + New Project
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
          <p className="text-2xl font-bold">{projects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Planning</h3>
          <p className="text-2xl font-bold text-blue-600">
            {projects.filter(p => p.status === 'Planning').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Ongoing</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {projects.filter(p => p.status === 'Ongoing').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
          <p className="text-2xl font-bold text-gray-600">
            {projects.filter(p => p.status === 'Completed').length}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No projects found. Create your first project to get started.
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{project.projectName}</div>
                    {project.appropriation && (
                      <div className="text-sm text-gray-500">{project.appropriation}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {project.projectLocation}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.district || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-4">
                    <button
                      onClick={() => router.push(`/projects/${project._id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View BOQ
                    </button>
                    <button
                      onClick={() => router.push(`/projects/${project._id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
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
              <strong>About Projects:</strong> Each project has a location which determines the labor rates 
              and material prices. Add BOQ items by selecting DUPA templates - they will be automatically 
              instantiated with location-specific rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
