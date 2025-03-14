import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExperimentWithUpdates, ExportData } from '../types';
import { getAllExperiments, getExperimentById, createExperiment, updateExperiment, deleteExperiment, addProgressUpdate } from '../services/experimentService';
import { importData } from '../services/importExportService';

type ExperimentContextType = {
  // Queries
  experiments: ExperimentWithUpdates[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Mutations
  createExperiment: (experimentData: any) => Promise<void>;
  updateExperiment: (id: number, experimentData: any) => Promise<void>;
  deleteExperiment: (id: number) => Promise<void>;
  addProgressUpdate: (experimentId: number, updateText: string) => Promise<void>;
  importData: (data: ExportData) => Promise<{ success: boolean; message: string }>;
};

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // Fetch all experiments
  const { data: experiments = [], isLoading, isError, error } = useQuery({
    queryKey: ['experiments'],
    queryFn: async () => {
      const allExperiments = await getAllExperiments();
      
      // For each experiment, fetch its progress updates
      const experimentsWithUpdates = await Promise.all(
        allExperiments.map(async (experiment) => {
          const experimentWithUpdates = await getExperimentById(experiment.id);
          return experimentWithUpdates as ExperimentWithUpdates;
        })
      );
      
      return experimentsWithUpdates.filter(Boolean) as ExperimentWithUpdates[];
    },
  });

  // Create experiment mutation
  const createExperimentMutation = useMutation({
    mutationFn: createExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  // Update experiment mutation
  const updateExperimentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateExperiment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  // Delete experiment mutation
  const deleteExperimentMutation = useMutation({
    mutationFn: deleteExperiment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  // Add progress update mutation
  const addProgressUpdateMutation = useMutation({
    mutationFn: ({ experimentId, updateText }: { experimentId: number; updateText: string }) => 
      addProgressUpdate(experimentId, updateText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  // Import data mutation
  const importDataMutation = useMutation({
    mutationFn: importData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const value = {
    // Queries
    experiments,
    isLoading,
    isError,
    error,
    
    // Mutations
    createExperiment: async (experimentData: any) => {
      await createExperimentMutation.mutateAsync(experimentData);
    },
    updateExperiment: async (id: number, experimentData: any) => {
      await updateExperimentMutation.mutateAsync({ id, data: experimentData });
    },
    deleteExperiment: async (id: number) => {
      await deleteExperimentMutation.mutateAsync(id);
    },
    addProgressUpdate: async (experimentId: number, updateText: string) => {
      await addProgressUpdateMutation.mutateAsync({ experimentId, updateText });
    },
    importData: async (data: ExportData) => {
      return await importDataMutation.mutateAsync(data);
    },
  };

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperiments = () => {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiments must be used within an ExperimentProvider');
  }
  return context;
};
