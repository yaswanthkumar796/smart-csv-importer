import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AuditTrailPDF from './AuditTrailPDF';
import { fetchDashboardData } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitWith, setSplitWith] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [addLoading, setAddLoading] = useState(false);

  const fetchBalances = async () => {
    try {
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load balances.');
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

  const handleManualAdd = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/expenses`, {
        description: desc,
        amount,
        paid_by: paidBy,
        date,
        split_with: splitWith
      });
      setDesc('');
      setAmount('');
      setPaidBy('');
      setSplitWith('');
      await fetchBalances();
    } catch (err) {
      alert('Failed to add expense. Check formatting.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleSettle = async (from, to, settleAmount) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/expenses/settle`, {
        from,
        to,
        amount: settleAmount
      });
      await fetchBalances();
    } catch (err) {
      alert('Failed to process settlement.');
    }
  };

  if (loading) return (
    <div className="card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', backgroundColor: 'var(--tertiary)' }}>
      <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '2px' }}>LOADING SECURE DATA...</h2>
    </div>
  );
  if (error) return <div className="card"><p style={{ color: 'var(--danger-text)' }}>{error}</p></div>;
  if (!data) return null;

  if (Object.keys(data.balances).length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '4px solid var(--border)', boxShadow: '8px 8px 0px var(--shadow-color)', backgroundColor: 'var(--primary)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: '900' }}>Upload Your First CSV</h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Your workspace is completely empty. Head over to the Import tab to get started!</p>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn" onClick={() => setSelectedUser(null)} style={{ backgroundColor: 'var(--tertiary)' }}>
            BACK TO DASHBOARD
          </button>
          
          {!auditLoading && auditData && (
            <PDFDownloadLink 
              document={<AuditTrailPDF userName={selectedUser} finalBalance={auditData.finalBalance} auditTrail={auditData.auditTrail} />}
              fileName={`${selectedUser}_Audit_Statement.pdf`}
            >
              {({ loading }) => (
                <button className="btn" style={{ backgroundColor: '#ffffff' }}>
                  {loading ? 'PREPARING...' : 'DOWNLOAD STATEMENT (PDF)'}
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>
        <h2>Audit Trail: {selectedUser}</h2>
        {auditLoading ? (
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Loading precise records...</p>
        ) : auditData ? (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '900' }}>
              NET BALANCE: 
              <span style={{ color: auditData.finalBalance >= 0 ? '#2e7d32' : 'var(--danger-bg)', marginLeft: '10px' }}>
                {auditData.finalBalance >= 0 ? `+ ₹${auditData.finalBalance} (Gets back)` : `- ₹${Math.abs(auditData.finalBalance)} (Owes)`}
              </span>
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Impact</th>
                    <th>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.auditTrail.map((record, idx) => (
                    <React.Fragment key={idx}>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>{record.description}</td>
                        <td style={{ padding: '12px', color: record.type === 'credit' ? '#2e7d32' : 'var(--danger-bg)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{record.type === 'credit' ? `+ ₹${record.amount}` : `- ₹${record.amount}`}</span>
                          {record.notes && record.notes.includes('Converted') && (
                            <button 
                              onClick={() => toggleRow(record.recordId)}
                              style={{ marginLeft: '10px', background: 'var(--primary)', border: '3px solid var(--border)', cursor: 'pointer', padding: '4px 8px', fontWeight: '900', boxShadow: '2px 2px 0px var(--shadow-color)' }}
                            >
                              {expandedRows[record.recordId] ? 'v' : '>'}
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontWeight: '900' }}>₹{record.runningBalance}</td>
                      </tr>
                      {expandedRows[record.recordId] && record.notes && (
                        <tr>
                          <td colSpan="4" style={{ padding: 0 }}>
                            <div style={{ backgroundColor: 'var(--tertiary)', borderBottom: '3px solid var(--border)', borderTop: '3px solid var(--border)', padding: '12px', paddingLeft: '40px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.95rem' }}>
                              💱 {record.notes}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
    <div>
      <div className="card" style={{ backgroundColor: 'var(--tertiary)', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', textTransform: 'uppercase' }}>Quick Add Expense (Equal Split)</h3>
        <form onSubmit={handleManualAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ padding: '8px', border: '3px solid var(--border)', fontWeight: 'bold' }} />
          <input type="text" placeholder="Description (e.g. Cinema)" value={desc} onChange={e => setDesc(e.target.value)} required style={{ padding: '8px', border: '3px solid var(--border)', fontWeight: 'bold' }} />
          <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} required style={{ padding: '8px', border: '3px solid var(--border)', fontWeight: 'bold' }} />
          <input type="text" placeholder="Paid By (e.g. Rohan)" value={paidBy} onChange={e => setPaidBy(e.target.value)} required style={{ padding: '8px', border: '3px solid var(--border)', fontWeight: 'bold' }} />
          <input type="text" placeholder="Split With (Aisha;Rohan;Priya)" value={splitWith} onChange={e => setSplitWith(e.target.value)} required style={{ padding: '8px', border: '3px solid var(--border)', fontWeight: 'bold', gridColumn: '1 / -1' }} />
          <button type="submit" className="btn" disabled={addLoading} style={{ gridColumn: '1 / -1' }}>
            {addLoading ? 'ADDING...' : 'ADD EXPENSE'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Group Balances</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          
          <div>
            <h3 style={{ textTransform: 'uppercase', borderBottom: '3px solid var(--border)', paddingBottom: '0.5rem' }}>Net Balances</h3>
            <ul className="anomaly-list" style={{ marginTop: '1rem' }}>
              {Object.entries(data.balances).map(([name, amount]) => (
                <li 
                  key={name} 
                  className="anomaly-item"
                  onClick={() => viewAudit(name)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', padding: '12px' }}
                >
                  <strong style={{ fontSize: '1.1rem' }}>{name}</strong>
                  <span style={{ color: amount >= 0 ? '#2e7d32' : 'var(--danger-bg)', fontWeight: '900', fontSize: '1.1rem' }}>
                    {amount >= 0 ? `+ ₹${amount}` : `- ₹${Math.abs(amount)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <h3 style={{ textTransform: 'uppercase', borderBottom: '3px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Standard Settlements</h3>
            {data.settlements && data.settlements.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.settlements.map((s, idx) => (
                  <li key={idx} style={{ padding: '0.5rem 0', borderBottom: '2px solid var(--border)' }}>
                    <strong>{s.from}</strong> owes <strong>{s.to}</strong> ₹{s.amount}
                    <button 
                      className="btn" 
                      style={{ padding: '4px 8px', marginLeft: '10px', fontSize: '0.8rem', backgroundColor: 'var(--secondary)' }}
                      onClick={() => handleSettle(s.from, s.to, s.amount)}
                    >
                      MARK PAID
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '1rem', border: '3px solid var(--border)', backgroundColor: 'var(--primary)', fontWeight: 'bold', boxShadow: '4px 4px 0px var(--shadow-color)' }}>
                ALL SETTLED UP!
              </div>
            )}
          </div>
          
          <div className="card" style={{ backgroundColor: '#ffffff', border: '4px solid #000000', margin: 0 }}>
            <h3 style={{ borderBottom: '4px solid #000000', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>🔥 OPTIMIZED SETTLEMENT PLAN</h3>
            {data.optimizedSettlements && data.optimizedSettlements.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.optimizedSettlements.map((s, idx) => (
                  <li key={idx} style={{ padding: '1rem 0', borderBottom: idx !== data.optimizedSettlements.length - 1 ? '2px solid var(--border)' : 'none', fontSize: '1.1rem' }}>
                    <span style={{ backgroundColor: 'var(--primary)', padding: '2px 6px', fontWeight: 'bold' }}>{s.from}</span> pays <span style={{ backgroundColor: 'var(--secondary)', padding: '2px 6px', fontWeight: 'bold' }}>{s.to}</span> <strong>₹{s.amount}</strong>
                    <button 
                      className="btn" 
                      style={{ padding: '6px 12px', marginLeft: '15px', fontSize: '0.9rem', backgroundColor: 'var(--primary)' }}
                      onClick={() => handleSettle(s.from, s.to, s.amount)}
                    >
                      MARK PAID
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontWeight: 'bold' }}>No optimized settlements needed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
