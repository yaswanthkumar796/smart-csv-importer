import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBalances = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/balances');
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

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card"><p style={{ color: 'var(--danger-text)' }}>{error}</p></div>;
  if (!data) return null;

  return (
    <div className="card">
      <h2>Group Balances</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        
        <div>
          <h3>Net Balances</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
            {Object.entries(data.balances).map(([name, amount]) => (
              <li key={name} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
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
            <p>Everyone is settled up!</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {data.settlements.map((settlement, idx) => (
                <li key={idx} style={{ padding: '0.75rem', backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '0.5rem', borderLeft: '4px solid #1565c0' }}>
                  <strong>{settlement.from}</strong> owes <strong>{settlement.to}</strong> <span style={{ fontWeight: 'bold', color: '#1565c0' }}>₹{settlement.amount}</span>
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
