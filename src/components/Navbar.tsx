import { Link } from 'react-router-dom';
import { useState } from 'react';
import { downloadExportedData } from '../services/importExportService';
import { useExperiments } from '../context/ExperimentContext';

const Navbar = () => {
  const { importData } = useExperiments();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (file: File) => {
    try {
      setIsImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const result = await importData(jsonData);
          
          alert(result.message);
        } catch (error) {
          console.error('Error importing data:', error);
          alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read the file. Please try again.');
      setIsImporting(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Experiments Dashboard</Link>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => downloadExportedData()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isImporting}
          >
            Export Data
          </button>
          
          <label 
            htmlFor="import-file" 
            className={`px-4 py-2 ${isImporting ? 'bg-gray-400' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded transition-colors cursor-pointer`}
          >
            {isImporting ? 'Importing...' : 'Import Data'}
            <input 
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              disabled={isImporting}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImport(file);
                  // Reset the input so the same file can be selected again
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
