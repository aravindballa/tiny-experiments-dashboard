import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initDB } from './db';
import { ExperimentProvider } from './context/ExperimentContext';
import Layout from './components/Layout';
import ExperimentList from './pages/ExperimentList';
import ExperimentDetail from './pages/ExperimentDetail';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const [dbInitialized, setDbInitialized] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize the database
        const success = await initDB();
        setDbInitialized(success);
        if (!success) {
          setError('Failed to initialize database');
        }
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setDbInitialized(false);
      }
    };

    initialize();
  }, []);

  if (dbInitialized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Initializing database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-md">
          <h2 className="text-lg font-bold mb-2">Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">
            Please check your browser console for more details and try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ExperimentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<ExperimentList />} />
              <Route path="experiment/:id" element={<ExperimentDetail />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ExperimentProvider>
    </QueryClientProvider>
  );
}

export default App;
