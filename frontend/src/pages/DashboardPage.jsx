import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext) || {};
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/projects', newProject);
      setProjects(prev => [res.data, ...prev]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      navigate(`/project/${res.data._id}`);
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (e) { console.error(e); }
  };

  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];

  return (
    <div className="dashboard-page">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span>⚡</span>
          <span style={{ fontFamily:'Outfit', fontWeight:700 }}>FlowStack</span>
        </div>
        <nav className="dash-nav">
          <button className="dash-nav-item active">🏠 Dashboard</button>
          <button className="dash-nav-item" onClick={() => navigate('/settings')}>⚙️ Settings</button>
        </nav>
        <div className="dash-user" onClick={handleLogout} title="Click to log out">
          <div className="dash-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="dash-user-name">{user?.name || 'User'}</div>
            <div className="dash-user-email">{user?.email || ''}</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Your Projects</h1>
            <p className="dash-subtitle">{projects.length} workspace{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        {loading ? (
          <div className="dash-loading"><div className="loader" /></div>
        ) : projects.length === 0 ? (
          <div className="dash-empty">
            <div className="empty-icon">🎨</div>
            <h2>No projects yet</h2>
            <p>Create your first visual workspace to get started.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((p, i) => (
              <div key={p._id} className="project-card" onClick={() => navigate(`/project/${p._id}`)}>
                <div className="project-card-banner" style={{ background: `linear-gradient(135deg, ${colors[i % colors.length]}33, ${colors[(i+2) % colors.length]}22)`, borderTop: `3px solid ${colors[i % colors.length]}` }} />
                <div className="project-card-body">
                  <div className="project-card-header">
                    <h3 className="project-name">{p.name}</h3>
                    <button className="btn btn-ghost btn-sm project-delete" onClick={(e) => deleteProject(p._id, e)} title="Delete">🗑</button>
                  </div>
                  <p className="project-desc">{p.description || 'No description'}</p>
                  <div className="project-meta">
                    <span>{p.blocks?.length || 0} blocks</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Project</span>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input autoFocus placeholder="My Awesome Project" value={newProject.name} onChange={e => setNewProject(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea placeholder="What's this project about?" rows={3} value={newProject.description} onChange={e => setNewProject(p => ({...p, description: e.target.value}))} style={{ resize:'vertical' }} />
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-page { display:flex; min-height:100vh; background:var(--bg-primary); }
        .dash-sidebar { width:240px; min-height:100vh; background:var(--bg-card); border-right:1px solid var(--border-color); display:flex; flex-direction:column; padding:1.5rem 1rem; position:sticky; top:0; }
        .dash-logo { display:flex; align-items:center; gap:0.5rem; font-size:1.2rem; color:var(--text-primary); padding:0.5rem 0.5rem 1.5rem; }
        .dash-nav { flex:1; display:flex; flex-direction:column; gap:0.25rem; }
        .dash-nav-item { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 0.75rem; border-radius:var(--radius-md); font-size:0.875rem; font-weight:500; color:var(--text-secondary); text-align:left; transition:all var(--transition-fast); }
        .dash-nav-item:hover,.dash-nav-item.active { background:var(--primary-alpha); color:var(--primary-color); }
        .dash-user { display:flex; align-items:center; gap:0.75rem; padding:0.75rem; border-top:1px solid var(--border-color); cursor:pointer; border-radius:var(--radius-md); margin-top:auto; }
        .dash-user:hover { background:var(--bg-hover); }
        .dash-avatar { width:34px; height:34px; background:var(--gradient-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:0.9rem; flex-shrink:0; }
        .dash-user-name { font-size:0.85rem; font-weight:600; color:var(--text-primary); }
        .dash-user-email { font-size:0.72rem; color:var(--text-muted); }
        .dash-main { flex:1; padding:2.5rem 3rem; }
        .dash-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:2.5rem; }
        .dash-title { font-family:'Outfit',sans-serif; font-size:1.85rem; font-weight:800; color:var(--text-primary); }
        .dash-subtitle { color:var(--text-muted); font-size:0.875rem; margin-top:0.2rem; }
        .dash-loading { display:flex; justify-content:center; padding:5rem; }
        .dash-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:5rem; text-align:center; }
        .empty-icon { font-size:4rem; }
        .dash-empty h2 { font-size:1.5rem; font-weight:700; color:var(--text-primary); }
        .dash-empty p { color:var(--text-secondary); }
        .projects-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.5rem; }
        .project-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-xl); overflow:hidden; cursor:pointer; transition:transform var(--transition-fast),box-shadow var(--transition-fast); }
        .project-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-md); }
        .project-card-banner { height:8px; }
        .project-card-body { padding:1.25rem; }
        .project-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem; }
        .project-name { font-size:1rem; font-weight:700; color:var(--text-primary); }
        .project-delete { opacity:0; transition:opacity var(--transition-fast); }
        .project-card:hover .project-delete { opacity:1; }
        .project-desc { font-size:0.82rem; color:var(--text-secondary); margin-bottom:1rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .project-meta { display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); }
        @media(max-width:768px) { .dash-sidebar{display:none;} .dash-main{padding:1.5rem;} }
      `}</style>
    </div>
  );
}
