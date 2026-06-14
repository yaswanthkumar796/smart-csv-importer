import React, { useState } from 'react';
import axios from 'axios';
import ImportReport from './components/ImportReport';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setReport(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Shared Expenses Manager</h1>
          <p>Settle up without the magic numbers.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn" 
            style={{ backgroundColor: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className="btn" 
            style={{ backgroundColor: activeTab === 'import' ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('import')}
          >
            Import CSV
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <>
          <div className="card upload-section">
            <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} disabled={!file || loading} className="btn">
              {loading ? 'Processing...' : 'Upload and Analyze CSV'}
            </button>
            {error && <p style={{ color: 'var(--danger-text)', marginTop: '1rem' }}>{error}</p>}
          </div>
          <ImportReport report={report} />
        </>
      )}

      {activeTab === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
