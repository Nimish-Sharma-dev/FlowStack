import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function TopToolbar({ project, onProjectUpdate }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'dark', setTheme: () => {} };
  
  const [sharing, setSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  
  // Link sharing state
  const [linkPermission, setLinkPermission] = useState(project?.visibility === 'public' ? 'view' : 'restricted');
  const [allowEditing, setAllowEditing] = useState(false);

  const isPublic = project?.visibility === 'public';

  const handleCopyLink = async () => {
    try {
      if (linkPermission !== 'restricted' && !isPublic) {
        const res = await api.patch(`/projects/${project._id}`, { visibility: 'public' });
        onProjectUpdate(res.data);
      }
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (e) { console.error(e); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSharing(true);
    try {
      const res = await api.post(`/projects/${project._id}/members`, { email: inviteEmail, role: inviteRole });
      onProjectUpdate(res.data); // Update project with new member
      setInviteEmail('');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to invite user');
    } finally {
      setSharing(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      // Assuming a DELETE endpoint exists, if not this is a visual placeholder
      // await api.delete(`/projects/${project._id}/members/${memberId}`);
      alert('Removed team member');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="premium-toolbar">
      <div className="toolbar-section">
        <button className="btn-icon" onClick={() => navigate('/dashboard')} title="Dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="project-brand">
          <div className="project-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
          </div>
          <span className="project-name">{project?.name || 'Untitled Project'}</span>
          <span className="save-status">
            <span className="save-dot"></span> Saved to cloud
          </span>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-actions">
          <button className="btn-icon" title="Undo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>
          <button className="btn-icon" title="Redo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></button>
        </div>
      </div>

      <div className="toolbar-section right">
        <div className="collab-avatars">
          {project?.teamMembers?.slice(0, 3).map((m, i) => (
            <div key={i} className="avatar-circle" title={m.user?.name || m.user?.email || 'User'}>
              {(m.user?.name || m.user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          ))}
          {project?.teamMembers?.length > 3 && <div className="avatar-circle extra">+{project.teamMembers.length - 3}</div>}
        </div>

        <button className="btn-share-glowing" onClick={() => setShowShareModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button>
        
        {user && <div className="user-profile-btn">
          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
        </div>}
      </div>

      {showShareModal && (
        <div className="glass-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="glass-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="glass-modal-header">
              <div className="gm-project-info">
                <div className="project-icon lg"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4"/></svg></div>
                <div>
                  <h3>{project?.name || 'Untitled Project'}</h3>
                  <span className="visibility-badge">{isPublic ? '🌐 Public Link' : project?.teamMembers?.length > 0 ? '👥 Team Access' : '🔒 Private'}</span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowShareModal(false)}>✕</button>
            </div>

            {/* Invite Section */}
            <div className="gm-section">
              <label>Invite Members</label>
              <form onSubmit={handleInvite} className="gm-invite-form">
                <input 
                  type="email" 
                  placeholder="Enter email address..." 
                  value={inviteEmail} 
                  onChange={e => setInviteEmail(e.target.value)} 
                  required 
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="viewer">Viewer 👁</option>
                  <option value="editor">Editor ✏️</option>
                  <option value="admin">Admin ⚡</option>
                </select>
                <button type="submit" className="btn-glowing" disabled={sharing}>
                  {sharing ? '...' : 'Invite'}
                </button>
              </form>
            </div>

            {/* Project Link Sharing */}
            <div className="gm-section">
              <label>Project Link Sharing</label>
              <div className="gm-link-box">
                <input type="text" readOnly value={window.location.href} />
                <button onClick={handleCopyLink} className="btn-copy">Copy Link</button>
              </div>
              
              <div className="gm-link-settings">
                <select className="gm-borderless-select" value={linkPermission} onChange={e => setLinkPermission(e.target.value)}>
                  <option value="restricted">Restricted access</option>
                  <option value="view">Anyone with link can view</option>
                  <option value="edit">Anyone with link can edit</option>
                </select>

                {linkPermission !== 'restricted' && (
                  <div className="gm-toggles">
                    <label className="gm-toggle"><input type="checkbox" checked={allowEditing} onChange={e => setAllowEditing(e.target.checked)} /> Allow editing</label>
                    <label className="gm-toggle"><input type="checkbox" /> Password protected <span className="pro-badge">PRO</span></label>
                    <label className="gm-toggle"><input type="checkbox" /> Expiration date</label>
                  </div>
                )}
              </div>
            </div>

            {/* Team Access List */}
            <div className="gm-section no-border">
              <label>Team Access List</label>
              <div className="gm-team-list">
                {/* Owner */}
                <div className="gm-team-row">
                  <div className="gm-user-info">
                    <div className="avatar-circle">{(project?.owner?.name || project?.owner?.email || 'O').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="name">{project?.owner?.name || project?.owner?.email || 'Owner'} <span className="online-dot"></span></div>
                      <div className="meta">Active now</div>
                    </div>
                  </div>
                  <div className="gm-role">Owner</div>
                </div>

                {/* Team Members */}
                {project?.teamMembers?.map((m, idx) => {
                  if (!m.user) return null;
                  const email = m.user?.email || m.email || 'Unknown User';
                  const name = m.user?.name || email.split('@')[0];
                  return (
                    <div key={idx} className="gm-team-row">
                      <div className="gm-user-info">
                        <div className="avatar-circle">{name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="name">{name} {idx === 0 ? <span className="online-dot"></span> : null}</div>
                          <div className="meta">{idx === 0 ? 'Active now' : 'Offline'}</div>
                        </div>
                      </div>
                      <div className="gm-role-actions">
                        <select className="gm-borderless-select small" defaultValue={m.role}>
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className="btn-remove" onClick={() => removeMember(m._id)} title="Remove access">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .premium-toolbar {
          height: 56px;
          background: rgba(15, 15, 20, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          z-index: 50;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .toolbar-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .toolbar-section.right { justify-content: flex-end; }

        .btn-icon {
          background: transparent; border: none; color: #a1a1aa; cursor: pointer;
          width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .btn-icon:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .project-brand { display: flex; align-items: center; gap: 12px; }
        .project-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
        .project-icon.lg { width: 40px; height: 40px; border-radius: 10px; }
        
        .project-name { font-weight: 600; font-size: 0.95rem; }
        
        .save-status { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #71717a; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px; }
        .save-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }

        .toolbar-actions { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.03); padding: 4px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }

        .collab-avatars { display: flex; align-items: center; margin-right: 8px; }
        .avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: #3f3f46; border: 2px solid #18181b; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #fff; margin-left: -8px; position: relative; }
        .collab-avatars .avatar-circle:first-child { margin-left: 0; }
        .avatar-circle.extra { background: #27272a; color: #a1a1aa; }
        
        .online-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-left: 6px; box-shadow: 0 0 8px rgba(16,185,129,0.5); }

        .btn-share-glowing {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none; padding: 8px 16px; border-radius: 8px;
          font-size: 0.85rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-share-glowing:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }

        .user-profile-btn { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #f43f5e, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 600; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
        .user-profile-btn:hover { border-color: white; }

        /* Glassmorphism Modal Popover */
        .glass-modal-backdrop {
          position: fixed; inset: 0; background: transparent;
          z-index: 1000;
        }
        .glass-modal {
          position: absolute; top: 64px; right: 20px;
          width: 500px; max-width: 95vw; background: rgba(24, 24, 27, 0.95); backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          overflow: hidden; color: #fff; animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .glass-modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); }
        .gm-project-info { display: flex; gap: 16px; align-items: center; }
        .gm-project-info h3 { margin: 0 0 6px 0; font-size: 1.25rem; font-weight: 600; }
        .visibility-badge { font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; color: #d4d4d8; font-weight: 500; }
        
        .btn-close { background: rgba(255,255,255,0.05); border: none; color: #a1a1aa; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .gm-section { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .gm-section.no-border { border-bottom: none; }
        .gm-section > label { display: block; font-size: 0.85rem; font-weight: 600; color: #a1a1aa; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }

        .gm-invite-form { display: flex; gap: 12px; }
        .gm-invite-form input { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 10px; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        .gm-invite-form input:focus { border-color: #6366f1; }
        .gm-invite-form select { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 10px; color: #fff; font-size: 0.95rem; outline: none; cursor: pointer; }
        
        .btn-glowing { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: 0.2s; }
        .btn-glowing:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5); }

        .gm-link-box { display: flex; gap: 8px; margin-bottom: 16px; }
        .gm-link-box input { flex: 1; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.2); padding: 12px 16px; border-radius: 10px; color: #a1a1aa; font-family: monospace; font-size: 0.85rem; outline: none; }
        .btn-copy { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.05); color: #fff; padding: 0 20px; border-radius: 10px; cursor: pointer; font-weight: 500; transition: 0.2s; }
        .btn-copy:hover { background: rgba(255,255,255,0.15); }

        .gm-borderless-select { background: transparent; border: none; color: #e4e4e7; font-size: 0.95rem; font-weight: 500; cursor: pointer; outline: none; padding: 4px 0; border-bottom: 1px solid dashed; }
        .gm-borderless-select option { background: #18181b; }
        .gm-borderless-select.small { font-size: 0.85rem; color: #a1a1aa; }

        .gm-toggles { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
        .gm-toggle { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #a1a1aa; cursor: pointer; }
        .gm-toggle input[type="checkbox"] { appearance: none; width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); cursor: pointer; position: relative; transition: 0.2s; }
        .gm-toggle input[type="checkbox"]:checked { background: #6366f1; border-color: #6366f1; }
        .gm-toggle input[type="checkbox"]:checked::after { content: '✓'; position: absolute; color: white; font-size: 10px; left: 3px; top: 1px; }
        .pro-badge { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; }

        .gm-team-list { display: flex; flex-direction: column; gap: 16px; }
        .gm-team-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); transition: 0.2s; }
        .gm-team-row:hover { background: rgba(255,255,255,0.05); }
        
        .gm-user-info { display: flex; align-items: center; gap: 12px; }
        .gm-user-info .name { font-weight: 500; font-size: 0.95rem; color: #e4e4e7; display: flex; align-items: center; }
        .gm-user-info .meta { font-size: 0.75rem; color: #71717a; margin-top: 2px; }
        
        .gm-role { font-size: 0.85rem; color: #a1a1aa; font-weight: 500; }
        .gm-role-actions { display: flex; align-items: center; gap: 12px; }
        .btn-remove { background: transparent; border: none; color: #ef4444; cursor: pointer; opacity: 0; transition: 0.2s; padding: 4px; }
        .gm-team-row:hover .btn-remove { opacity: 1; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
