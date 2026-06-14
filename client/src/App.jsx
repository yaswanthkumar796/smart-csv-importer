import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImportReport from './components/ImportReport';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleAuthSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', jwtToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

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
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setReport(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="container"><Auth onAuthSuccess={handleAuthSuccess} /></div>;
  }

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Shared Expenses</h1>
          <p>Logged in as: <strong>{currentUser.name}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
            Import
          </button>
          <button 
            className="btn" 
            style={{ backgroundColor: 'transparent', color: 'var(--danger-text)', border: '1px solid var(--danger-text)', padding: '8px 16px' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <>
          <div className="card upload-section">
            <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
            <button onClick={handleUpload} disabled={!file || loading} className="btn">
              {loading ? 'Processing...' : 'Upload CSV'}
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
