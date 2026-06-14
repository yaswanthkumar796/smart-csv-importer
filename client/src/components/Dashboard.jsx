import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchBalances = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/balances`);
      setData(response.data);
    } catch (err) {
      setError('Failed to load balances. Have you imported data yet?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const viewAudit = async (userName) => {
    setSelectedUser(userName);
    setAuditLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/audit/${userName}`);
      setAuditData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card"><p style={{ color: 'var(--danger-text)' }}>{error}</p></div>;
  if (!data) return null;

  if (selectedUser) {
    return (
      <div className="card">
        <button className="btn" onClick={() => setSelectedUser(null)} style={{ marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
          &larr; Back to Group Balances
        </button>
        <h2>Audit Trail: {selectedUser}</h2>
        {auditLoading ? (
          <p style={{ marginTop: '1rem' }}>Loading precise records...</p>
        ) : auditData ? (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
              <strong>Net Balance: </strong> 
              <span style={{ color: auditData.finalBalance >= 0 ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                {auditData.finalBalance >= 0 ? `+ ₹${auditData.finalBalance} (Gets back)` : `- ₹${Math.abs(auditData.finalBalance)} (Owes)`}
              </span>
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f7f6', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Description</th>
                    <th style={{ padding: '12px' }}>Impact</th>
                    <th style={{ padding: '12px' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.auditTrail.map((record, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{record.description}</td>
                      <td style={{ padding: '12px', color: record.type === 'credit' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                        {record.type === 'credit' ? `+ ₹${record.amount}` : `- ₹${record.amount}`}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: record.runningBalance < 0 ? '#c62828' : 'inherit' }}>
                        ₹{record.runningBalance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>No records found.</p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Group Balances</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        
        <div>
          <h3>Net Balances</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Click any user to view their exact audit trail (Rohan's Request).
          </p>
          <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
            {Object.entries(data.balances).map(([name, amount]) => (
              <li 
                key={name} 
                onClick={() => viewAudit(name)}
                style={{ padding: '1rem', border: '3px solid transparent', borderBottom: '3px solid var(--border)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.1s', borderRadius: '4px' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '4px 4px 0px var(--shadow-color)'; e.currentTarget.style.transform = 'translate(-2px, -2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderBottom = '3px solid var(--border)'; }}
              >
                <strong>{name}</strong>
                <span style={{ color: amount >= 0 ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                  {amount >= 0 ? `+ ₹${amount}` : `- ₹${Math.abs(amount)}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>How to Settle Up</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Aisha's Request: "Who pays whom, how much, done."
          </p>
          {data.settlements.length === 0 ? (
            <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>Everyone is settled up!</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {data.settlements.map((settlement, idx) => (
                <li key={idx} style={{ padding: '1rem', backgroundColor: 'var(--tertiary)', borderRadius: '4px', marginBottom: '1rem', border: '3px solid var(--border)', boxShadow: '4px 4px 0px var(--shadow-color)' }}>
                  <strong>{settlement.from}</strong> owes <strong>{settlement.to}</strong> <span style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '1.1rem', float: 'right' }}>₹{settlement.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
