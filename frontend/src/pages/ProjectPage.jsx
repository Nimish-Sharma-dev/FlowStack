import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Canvas from '../components/Canvas/Canvas';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function ProjectPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext) || {};
  const [project, setProject] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="loader" />
    </div>
  );

  if (!project) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-secondary)' }}>
      Project not found.
    </div>
  );

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Top toolbar strip */}
      <div style={{
        height: 48, background:'var(--bg-card)', borderBottom:'1px solid var(--border-color)',
        display:'flex', alignItems:'center', padding:'0 1.25rem', gap:'1rem', zIndex:10
      }}>
        <a href="/dashboard" style={{ fontSize:'0.85rem', color:'var(--text-muted)', textDecoration:'none' }}>← Dashboard</a>
        <span style={{ color:'var(--border-color)' }}>|</span>
        <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.95rem' }}>{project.name}</span>
        <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:'var(--text-muted)' }}>
          {project.blocks?.length || 0} blocks · {project.teamMembers?.length || 1} member{project.teamMembers?.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Canvas fills remaining height */}
      <div style={{ flex:1, overflow:'hidden' }}>
        <Canvas
          projectId={projectId}
          userId={user?._id}
          userName={user?.name || 'Anonymous'}
          initialBlocks={project.blocks || []}
          initialConnections={project.connections || []}
        />
      </div>
    </div>
  );
}
