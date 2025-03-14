export type ExperimentStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Experiment {
  id: number;
  name: string;
  why: string;
  how: string;
  expectation: string;
  status: ExperimentStatus;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdate {
  id: number;
  experiment_id: number;
  update_text: string;
  update_date: string;
}

export interface ExperimentWithUpdates extends Experiment {
  progress_updates: ProgressUpdate[];
}

export interface ExportData {
  experiments: ExperimentWithUpdates[];
}
