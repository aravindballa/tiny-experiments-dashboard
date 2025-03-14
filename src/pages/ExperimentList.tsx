import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExperiments } from '../context/ExperimentContext';
import { Experiment, ExperimentStatus } from '../types';
import ExperimentForm from '../components/ExperimentForm';

const ExperimentList = () => {
  const { experiments, isLoading, isError, error } = useExperiments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ExperimentStatus | 'All'>('All');
  const [sortField, setSortField] = useState<keyof Experiment>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter experiments by status
  const filteredExperiments = experiments.filter(experiment => {
    if (statusFilter === 'All') return true;
    return experiment.status === statusFilter;
  });

  // Sort experiments by the selected field
  const sortedExperiments = [...filteredExperiments].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Experiment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error?.message || 'Failed to load experiments'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Experiments</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Add Experiment
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Experiment</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <ExperimentForm onClose={() => setShowAddForm(false)} />
          </div>
        </div>
      )}

      <div className="flex space-x-4 mb-4">
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExperimentStatus | 'All')}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="All">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {sortedExperiments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No experiments found. Create your first experiment!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortField === 'name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="py-3 px-4 text-left cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSort('updated_at')}
                >
                  Last Updated
                  {sortField === 'updated_at' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedExperiments.map((experiment) => (
                <tr key={experiment.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link to={`/experiments/${experiment.id}`} className="text-blue-600 hover:underline font-medium">
                      {experiment.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      experiment.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                      experiment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      experiment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {experiment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(experiment.updated_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Link 
                      to={`/experiments/${experiment.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExperimentList;
