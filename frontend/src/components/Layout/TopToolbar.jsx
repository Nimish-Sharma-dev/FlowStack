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
  const [sharing, setSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const handleCopyLink = async () => {
    try {
      await api.patch(`/projects/${projectId}`, { visibility: 'public' });
      await navigator.clipboard.writeText(window.location.href);
      alert('Public link copied! Anyone with the link can view/edit.');
    } catch (e) { console.error(e); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSharing(true);
    try {
      await api.post(`/projects/${projectId}/members`, { email: inviteEmail, role: inviteRole });
      alert(`Invited ${inviteEmail} as ${inviteRole}!`);
      setInviteEmail('');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to invite user');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="top-toolbar">
      <div className="toolbar-left">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
          ←
        </button>
        <span className="project-title">{projectName || 'Untitled Project'}</span>
      </div>

      <div className="toolbar-center">
        {/* Placeholder for future tools */}
      </div>

      <div className="toolbar-right">
        <button className="btn btn-primary btn-sm" onClick={() => setShowShareModal(true)}>
          🔗 Share
        </button>
        <button className="btn btn-ghost btn-sm" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {showShareModal && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="share-header">
              <h3>Share Project</h3>
              <button onClick={() => setShowShareModal(false)} className="btn btn-ghost">✕</button>
            </div>
            
            <form onSubmit={handleInvite} className="invite-form">
              <input type="email" placeholder="Collaborator's email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required style={{ fontSize: '1rem', padding: '0.75rem' }} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ padding: '0.75rem' }}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button type="submit" className="btn btn-primary" disabled={sharing} style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>{sharing ? '...' : 'Invite'}</button>
            </form>

            <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Or share a public link</span>
              <button onClick={handleCopyLink} className="btn btn-outline btn-sm">Copy Link</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .share-modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .share-modal {
          background: var(--bg-card); padding: 2rem; border-radius: 12px; width: 600px; max-width: 90vw; border: 1px solid var(--border-color); box-shadow: var(--shadow-xl);
        }
        .share-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .share-header h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .invite-form { display: flex; gap: 0.75rem; }
        .invite-form input { flex: 1; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); }
        .invite-form select { border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); }
      `}</style>
    </div>
  );
}
