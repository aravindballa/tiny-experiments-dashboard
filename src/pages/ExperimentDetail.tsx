import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExperimentById, deleteExperiment, addProgressUpdate } from '../services/experimentService';
import ExperimentForm from '../components/ExperimentForm';

const ExperimentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const experimentId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  // Fetch experiment details
  const { data: experiment, isLoading, isError, error } = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: () => getExperimentById(experimentId),
    enabled: !!experimentId,
  });

  // Delete experiment mutation
  const deleteMutation = useMutation({
    mutationFn: deleteExperiment,
    onSuccess: () => {
      navigate('/');
    },
  });

  // Add progress update mutation
  const addUpdateMutation = useMutation({
    mutationFn: ({ experimentId, updateText }: { experimentId: number; updateText: string }) => 
      addProgressUpdate(experimentId, updateText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', experimentId] });
      setProgressUpdate('');
      setIsAddingUpdate(false);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this experiment? This action cannot be undone.')) {
      deleteMutation.mutate(experimentId);
    }
  };

  const handleAddProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressUpdate.trim()) return;
    
    setIsAddingUpdate(true);
    try {
      await addUpdateMutation.mutateAsync({ experimentId, updateText: progressUpdate });
    } catch (error) {
      console.error('Error adding progress update:', error);
      alert('Failed to add progress update. Please try again.');
      setIsAddingUpdate(false);
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
        <span className="block sm:inline"> {error instanceof Error ? error.message : 'Failed to load experiment'}</span>
        <Link to="/" className="block mt-4 text-blue-600 hover:underline">Back to Experiments</Link>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found!</strong>
        <span className="block sm:inline"> The experiment you're looking for doesn't exist.</span>
        <Link to="/" className="block mt-4 text-blue-600 hover:underline">Back to Experiments</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            &larr; Back
          </Link>
          <h1 className="text-2xl font-bold">{experiment.name}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            experiment.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
            experiment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            experiment.status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {experiment.status}
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowEditForm(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {showEditForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Experiment</h2>
            <button 
              onClick={() => setShowEditForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
          <ExperimentForm 
            experimentId={experimentId}
            initialData={{
              name: experiment.name,
              why: experiment.why,
              how: experiment.how,
              expectation: experiment.expectation,
              status: experiment.status,
            }}
            onClose={() => setShowEditForm(false)}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Why</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{experiment.why}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">How</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{experiment.how}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Expectation</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{experiment.expectation}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Dates</h2>
              <p className="text-gray-700">
                <span className="font-medium">Created:</span> {new Date(experiment.created_at).toLocaleString()}<br />
                <span className="font-medium">Last Updated:</span> {new Date(experiment.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Progress Updates</h2>
        
        <form onSubmit={handleAddProgressUpdate} className="mb-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="progress-update" className="text-sm font-medium text-gray-700">Add Progress Update</label>
            <textarea
              id="progress-update"
              value={progressUpdate}
              onChange={(e) => setProgressUpdate(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe your progress..."
              disabled={isAddingUpdate}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={!progressUpdate.trim() || isAddingUpdate}
            >
              {isAddingUpdate ? 'Adding...' : 'Add Update'}
            </button>
          </div>
        </form>
        
        <div className="space-y-4">
          {experiment.progress_updates.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No progress updates yet.</p>
          ) : (
            experiment.progress_updates.map((update) => (
              <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-700 whitespace-pre-wrap">{update.update_text}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(update.update_date).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetail;
