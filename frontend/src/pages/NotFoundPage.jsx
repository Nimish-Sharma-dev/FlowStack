import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:'1rem', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontSize:'5rem' }}>🌌</div>
      <h1 style={{ fontSize:'3rem', fontWeight:800, color:'var(--text-primary)' }}>404</h1>
      <p style={{ color:'var(--text-secondary)', fontSize:'1.125rem' }}>This page doesn't exist yet.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>← Go Home</button>
    </div>
  );
}
