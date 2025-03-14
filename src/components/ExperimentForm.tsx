import { useState } from 'react';
import { useExperiments } from '../context/ExperimentContext';
import { ExperimentStatus } from '../types';

interface ExperimentFormProps {
  experimentId?: number;
  initialData?: {
    name: string;
    why: string;
    how: string;
    expectation: string;
    status: ExperimentStatus;
  };
  onClose: () => void;
}

const ExperimentForm = ({ experimentId, initialData, onClose }: ExperimentFormProps) => {
  const { createExperiment, updateExperiment } = useExperiments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    why: initialData?.why || '',
    how: initialData?.how || '',
    expectation: initialData?.expectation || '',
    status: initialData?.status || 'Planned' as ExperimentStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.why.trim()) {
      newErrors.why = 'Why is required';
    }
    
    if (!formData.how.trim()) {
      newErrors.how = 'How is required';
    }
    
    if (!formData.expectation.trim()) {
      newErrors.expectation = 'Expectation is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (experimentId) {
        // Update existing experiment
        await updateExperiment(experimentId, formData);
      } else {
        // Create new experiment
        await createExperiment(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving experiment:', error);
      alert('Failed to save experiment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Experiment name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="why" className="block text-sm font-medium text-gray-700 mb-1">Why</label>
        <textarea
          id="why"
          name="why"
          value={formData.why}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md ${errors.why ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Purpose of the experiment"
        />
        {errors.why && <p className="mt-1 text-sm text-red-600">{errors.why}</p>}
      </div>
      
      <div>
        <label htmlFor="how" className="block text-sm font-medium text-gray-700 mb-1">How</label>
        <textarea
          id="how"
          name="how"
          value={formData.how}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md ${errors.how ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Methodology"
        />
        {errors.how && <p className="mt-1 text-sm text-red-600">{errors.how}</p>}
      </div>
      
      <div>
        <label htmlFor="expectation" className="block text-sm font-medium text-gray-700 mb-1">Expectation</label>
        <textarea
          id="expectation"
          name="expectation"
          value={formData.expectation}
          onChange={handleChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md ${errors.expectation ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Expected outcome"
        />
        {errors.expectation && <p className="mt-1 text-sm text-red-600">{errors.expectation}</p>}
      </div>
      
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : experimentId ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default ExperimentForm;
