import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Canvas from '../components/Canvas/Canvas';
import TopToolbar from '../components/Layout/TopToolbar';
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
      <TopToolbar projectName={project.name} />

      {/* Canvas fills remaining height */}
      <div style={{ flex:1, overflow:'hidden', display: 'flex' }}>
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
