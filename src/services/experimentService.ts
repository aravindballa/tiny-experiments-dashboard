import { db } from '../db';
import { Experiment, ExperimentStatus, ExperimentWithUpdates, ProgressUpdate } from '../types';

// Get all experiments
export const getAllExperiments = async (): Promise<Experiment[]> => {
  try {
    const result = await db.query(`
      SELECT * FROM experiments 
      ORDER BY updated_at DESC
    `);
    return result.rows as Experiment[];
  } catch (error) {
    console.error('Error fetching experiments:', error);
    throw error;
  }
};

// Get a single experiment by ID
export const getExperimentById = async (id: number): Promise<ExperimentWithUpdates | null> => {
  try {
    // Get the experiment
    const experimentResult = await db.query(`
      SELECT * FROM experiments WHERE id = $1
    `, [id]);

    if (experimentResult.rows.length === 0) {
      return null;
    }

    const experiment = experimentResult.rows[0] as Experiment;

    // Get the progress updates for this experiment
    const updatesResult = await db.query(`
      SELECT * FROM progress_updates 
      WHERE experiment_id = $1 
      ORDER BY update_date DESC
    `, [id]);

    const progressUpdates = updatesResult.rows as ProgressUpdate[];

    return {
      ...experiment,
      progress_updates: progressUpdates,
    };
  } catch (error) {
    console.error(`Error fetching experiment with ID ${id}:`, error);
    throw error;
  }
};

// Create a new experiment
export const createExperiment = async (experiment: Omit<Experiment, 'id' | 'created_at' | 'updated_at'>): Promise<Experiment> => {
  try {
    const { name, why, how, expectation, status } = experiment;
    
    const result = await db.query(`
      INSERT INTO experiments (name, why, how, expectation, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, why, how, expectation, status]);

    return result.rows[0] as Experiment;
  } catch (error) {
    console.error('Error creating experiment:', error);
    throw error;
  }
};

// Update an existing experiment
export const updateExperiment = async (id: number, experiment: Partial<Omit<Experiment, 'id' | 'created_at' | 'updated_at'>>): Promise<Experiment> => {
  try {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (experiment.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(experiment.name);
      paramIndex++;
    }

    if (experiment.why !== undefined) {
      updates.push(`why = $${paramIndex}`);
      values.push(experiment.why);
      paramIndex++;
    }

    if (experiment.how !== undefined) {
      updates.push(`how = $${paramIndex}`);
      values.push(experiment.how);
      paramIndex++;
    }

    if (experiment.expectation !== undefined) {
      updates.push(`expectation = $${paramIndex}`);
      values.push(experiment.expectation);
      paramIndex++;
    }

    if (experiment.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(experiment.status);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // If no fields to update, just return the current experiment
    if (updates.length === 1) { // Only updated_at
      const result = await db.query(`SELECT * FROM experiments WHERE id = $1`, [id]);
      return result.rows[0] as Experiment;
    }

    const setClause = updates.join(', ');
    values.push(id);

    const result = await db.query(`
      UPDATE experiments
      SET ${setClause}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result.rows[0] as Experiment;
  } catch (error) {
    console.error(`Error updating experiment with ID ${id}:`, error);
    throw error;
  }
};

// Delete an experiment
export const deleteExperiment = async (id: number): Promise<boolean> => {
  try {
    // Due to CASCADE constraint, this will also delete related progress updates
    const result = await db.query(`
      DELETE FROM experiments WHERE id = $1
      RETURNING id
    `, [id]);

    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error deleting experiment with ID ${id}:`, error);
    throw error;
  }
};

// Add a progress update to an experiment
export const addProgressUpdate = async (experimentId: number, updateText: string): Promise<ProgressUpdate> => {
  try {
    const result = await db.query(`
      INSERT INTO progress_updates (experiment_id, update_text)
      VALUES ($1, $2)
      RETURNING *
    `, [experimentId, updateText]);

    // Also update the experiment's updated_at timestamp
    await db.query(`
      UPDATE experiments
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [experimentId]);

    return result.rows[0] as ProgressUpdate;
  } catch (error) {
    console.error(`Error adding progress update to experiment with ID ${experimentId}:`, error);
    throw error;
  }
};

// Get all progress updates for an experiment
export const getProgressUpdates = async (experimentId: number): Promise<ProgressUpdate[]> => {
  try {
    const result = await db.query(`
      SELECT * FROM progress_updates
      WHERE experiment_id = $1
      ORDER BY update_date DESC
    `, [experimentId]);

    return result.rows as ProgressUpdate[];
  } catch (error) {
    console.error(`Error fetching progress updates for experiment with ID ${experimentId}:`, error);
    throw error;
  }
};
