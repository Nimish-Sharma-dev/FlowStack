import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext) || {};
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/me', { name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'1.25rem 2rem', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'1rem' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Back</button>
        <h1 style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--text-primary)' }}>Settings</h1>
      </div>
      <div style={{ maxWidth:500, margin:'3rem auto', padding:'0 1.5rem', width:'100%' }}>
        <div className="card">
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem', color:'var(--text-primary)' }}>Profile</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input value={user?.email || ''} disabled style={{ opacity:0.6 }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop:'0.5rem' }}>
              {saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
        <div className="card" style={{ marginTop:'1.5rem', borderColor:'var(--error-color)' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'0.5rem', color:'var(--error-color)' }}>Danger Zone</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem', marginBottom:'1rem' }}>Logging out will end your session.</p>
          <button className="btn btn-danger" onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );
}
