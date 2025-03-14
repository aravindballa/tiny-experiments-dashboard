import { PGlite } from "@electric-sql/pglite";

// Initialize the database with persistence to IndexedDB
// Note: We create the instance but wait for ready state before using it
export const db = new PGlite("idb://experiments-dashboard");

// Initialize the database schema
export const initDB = async () => {
  try {
    // Ensure PGlite is ready before any operations
    // This is required for WebAssembly to be properly loaded
    await db.ready;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Give extra time for WebAssembly initialization

    // Create experiments table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS experiments (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        why TEXT NOT NULL,
        how TEXT NOT NULL,
        expectation TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create progress_updates table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS progress_updates (
        id SERIAL PRIMARY KEY,
        experiment_id INTEGER NOT NULL,
        update_text TEXT NOT NULL,
        update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
      )
    `);

    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};
