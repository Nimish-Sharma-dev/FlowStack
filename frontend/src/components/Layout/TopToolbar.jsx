import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function TopToolbar({ projectName }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useContext(AuthContext) || {};
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'dark', setTheme: () => {} };
  const [zoom, setZoomDisplay] = useState(100);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await api.patch(`/projects/${projectId}`, { visibility: 'public' });
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied! Anyone with the link can view this project.');
    } catch (e) { console.error(e); }
    finally { setSharing(false); }
  };

  return (
    <div className="top-toolbar">
      <div className="toolbar-left">
        <button className="btn btn-ghost toolbar-back" onClick={() => navigate('/dashboard')} title="Back to dashboard">
          ← <span className="toolbar-project-name">{projectName || 'Project'}</span>
        </button>
      </div>

      <div className="toolbar-center">
        <button className="toolbar-tool active" title="Select (V)">▲</button>
        <button className="toolbar-tool" title="Block (B)">□</button>
        <button className="toolbar-tool" title="Connect (C)">↗</button>
        <button className="toolbar-tool" title="Text (T)">T</button>
        <div className="toolbar-divider" />
        <button className="toolbar-tool" title="Zoom out">−</button>
        <span className="toolbar-zoom">{zoom}%</span>
        <button className="toolbar-tool" title="Zoom in">+</button>
      </div>

      <div className="toolbar-right">
        <button className="btn btn-primary btn-sm" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Generating...' : '🔗 Share Link'}
        </button>
        <button className="btn btn-ghost btn-sm" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="toolbar-avatar" title={user?.name || 'You'}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>

      <style>{`
        .top-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          height: 52px; padding: 0 1rem;
          background: var(--bg-card); border-bottom: 1px solid var(--border-color);
          gap: 1rem; z-index: 50;
        }
        .toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 0.5rem; min-width: 160px; }
        .toolbar-right { justify-content: flex-end; }
        .toolbar-back { font-size: 0.85rem; color: var(--text-secondary); gap: 0.4rem; }
        .toolbar-project-name { color: var(--text-primary); font-weight: 600; }
        .toolbar-center { display: flex; align-items: center; gap: 0.25rem; }
        .toolbar-tool {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary);
          transition: all var(--transition-fast); cursor: pointer; border: none; background: none;
        }
        .toolbar-tool:hover { background: var(--bg-hover); color: var(--text-primary); }
        .toolbar-tool.active { background: var(--primary-alpha); color: var(--primary-color); }
        .toolbar-divider { width: 1px; height: 20px; background: var(--border-color); margin: 0 0.25rem; }
        .toolbar-zoom { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); min-width: 36px; text-align: center; }
        .toolbar-avatar {
          width: 30px; height: 30px; background: var(--gradient-primary); border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.78rem; cursor: default;
        }
      `}</style>
    </div>
  );
}
