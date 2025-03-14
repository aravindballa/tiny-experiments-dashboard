import { SQLite3 } from '@vlcn.io/crsqlite-wasm';

let db: SQLite3;

// Initialize the database schema
export const initDB = async () => {
  try {
    // Initialize SQLite instance
    db = await SQLite3.init();

    // Create experiments table
    await db.execMany([`
      CREATE TABLE IF NOT EXISTS experiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        why TEXT NOT NULL,
        how TEXT NOT NULL,
        expectation TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS progress_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id INTEGER NOT NULL,
        update_text TEXT NOT NULL,
        update_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE
      );
    `]);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Export database instance
export { db };
