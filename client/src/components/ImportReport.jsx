import React from 'react';

const ImportReport = ({ report }) => {
  if (!report) return null;

  const { validRows, anomalies } = report;

  return (
    <div className="card">
      <h2>Import Report</h2>
      
      <div className="report-summary">
        <div className="stat-box">
          <h3>{validRows.length}</h3>
          <p>Valid Rows Processed</p>
        </div>
        <div className="stat-box">
          <h3>{anomalies.length}</h3>
          <p>Anomalies Detected</p>
        </div>
      </div>

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
