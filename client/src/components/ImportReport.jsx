import React, { useState } from 'react';
import axios from 'axios';

const ImportReport = ({ report }) => {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!report) return null;

  const { validRows, anomalies } = report;

  const handleConfirm = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/import/confirm', { validRows });
      setSuccess('All valid expenses have been successfully saved to the database!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Import Report</h2>
      
      <div className="report-summary">
        <div className="stat-box">
          <h3>{validRows.length}</h3>
          <p>Valid Rows Ready</p>
        </div>
        <div className="stat-box">
          <h3>{anomalies.length}</h3>
          <p>Anomalies Detected</p>
        </div>
      </div>

      {!success && validRows.length > 0 && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button 
            className="btn" 
            onClick={handleConfirm} 
            disabled={saving}
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {saving ? 'Saving to Database...' : 'Confirm & Save Valid Rows'}
          </button>
          {error && <p style={{ color: 'var(--danger-text)', marginTop: '1rem' }}>{error}</p>}
        </div>
      )}

      {success && (
        <div style={{ padding: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
          {success}
        </div>
      )}

      {anomalies.length > 0 && (
        <div>
          <h3>Anomaly Log</h3>
          <ul className="anomaly-list">
            {anomalies.map((anomaly, index) => (
              <li key={index} className={`anomaly-item ${anomaly.action}`}>
                <div>
                  <strong>Issue: {anomaly.issue}</strong>
                  <div className="row-details">
                    Date: {anomaly.row.date} | Desc: {anomaly.row.description} | Amt: {anomaly.row.amount} {anomaly.row.currency}
                  </div>
                </div>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                  Action: {anomaly.action.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImportReport;
