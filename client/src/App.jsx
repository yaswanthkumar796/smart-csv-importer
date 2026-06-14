import React, { useState } from 'react';
import axios from 'axios';
import ImportReport from './components/ImportReport';

function App() {
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
      <div className="header">
        <h1>Shared Expenses Manager</h1>
        <p>Upload your CSV to sync group expenses securely.</p>
      </div>

      <div className="card upload-section">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="file-input"
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="btn"
        >
          {loading ? 'Processing...' : 'Upload and Analyze CSV'}
        </button>
        {error && <p style={{ color: 'var(--danger-text)', marginTop: '1rem' }}>{error}</p>}
      </div>

      <ImportReport report={report} />
    </div>
  );
}

export default App;
