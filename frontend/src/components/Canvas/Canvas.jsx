import React, { useRef, useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { useKeyboard } from '../../hooks/useKeyboard';

const GRID_SIZE = 30;
const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Canvas({ projectId, userId, userName, initialBlocks = [], initialConnections = [] }) {
  const canvasRef = useRef(null);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [connections, setConnections] = useState(initialConnections);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [cursors, setCursors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const { on, emit } = useSocket(projectId, userId, userName);

  // Socket listeners
  useEffect(() => {
    const unsubCreated = on('block_created', (block) => {
      setBlocks(prev => prev.some(b => b._id === block._id) ? prev : [...prev, block]);
    });
    const unsubUpdated = on('block_updated', ({ blockId, changes }) => {
      setBlocks(prev => prev.map(b => b._id === blockId ? { ...b, ...changes } : b));
    });
    const unsubDeleted = on('block_deleted', ({ blockId }) => {
      setBlocks(prev => prev.filter(b => b._id !== blockId));
    });
    const unsubCursor = on('cursor_update', ({ userId: uid, userName: uname, x, y }) => {
      setCursors(prev => ({ ...prev, [uid]: { x, y, name: uname } }));
    });
    const unsubConnCreated = on('connection_created', (conn) => {
      setConnections(prev => prev.some(c => c._id === conn._id) ? prev : [...prev, conn]);
    });
    return () => { unsubCreated?.(); unsubUpdated?.(); unsubDeleted?.(); unsubCursor?.(); unsubConnCreated?.(); };
  }, [on]);

  // Keyboard shortcuts
  useKeyboard({
    onDelete: () => { if (selectedId) deleteBlock(selectedId); },
    onEscape: () => { setSelectedId(null); setConnecting(null); setContextMenu(null); },
    onNew: () => createBlock(200, 200),
    onZoomIn: () => setZoom(z => Math.min(MAX_ZOOM, z + 0.1)),
    onZoomOut: () => setZoom(z => Math.max(MIN_ZOOM, z - 0.1)),
    onZoomReset: () => { setZoom(1); setPan({ x: 0, y: 0 }); },
  });

  // Convert screen coords to canvas coords
  const toCanvas = useCallback((sx, sy) => ({
    x: (sx - pan.x) / zoom,
    y: (sy - pan.y) / zoom,
  }), [pan, zoom]);

  const createBlock = async (cx, cy) => {
    const pos = { x: cx - 125, y: cy - 60 };
    const tempBlock = {
      _id: `temp-${generateId()}`,
      projectId, title: 'New Block',
      position: pos, size: { width: 250, height: 120 },
      color: '#6366f1', status: 'todo', priority: 'medium',
      tags: [], createdBy: userId,
    };
    setBlocks(prev => [...prev, tempBlock]);
    try {
      const res = await api.post('/blocks', { projectId, title: 'New Block', position: pos, size: { width: 250, height: 120 } });
      setBlocks(prev => prev.map(b => b._id === tempBlock._id ? res.data : b));
      emit('block_created', { projectId, block: res.data });
      setSelectedId(res.data._id);
    } catch (e) {
      setBlocks(prev => prev.filter(b => b._id !== tempBlock._id));
    }
  };

  const deleteBlock = async (blockId) => {
    setBlocks(prev => prev.filter(b => b._id !== blockId));
    setSelectedId(null);
    try {
      await api.delete(`/blocks/${blockId}`);
      emit('block_deleted', { projectId, blockId });
    } catch (e) { console.error(e); }
  };

  const updateBlockPos = async (blockId, position) => {
    setBlocks(prev => prev.map(b => b._id === blockId ? { ...b, position } : b));
    try {
      await api.patch(`/blocks/${blockId}`, { position });
      emit('block_updated', { projectId, blockId, changes: { position } });
    } catch (e) { console.error(e); }
  };

  // MOUSE EVENTS
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-grid')) {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else if (e.button === 0) {
        setSelectedId(null);
        setContextMenu(null);
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isPanning && panStart) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (dragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left - pan.x) / zoom;
      const cy = (e.clientY - rect.top - pan.y) / zoom;
      const newPos = { x: cx - dragging.offsetX, y: cy - dragging.offsetY };
      setBlocks(prev => prev.map(b => b._id === dragging.blockId ? { ...b, position: newPos } : b));
      return;
    }
    // Emit cursor position
    if (projectId && userId) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const cx = (e.clientX - rect.left - pan.x) / zoom;
        const cy = (e.clientY - rect.top - pan.y) / zoom;
        emit('cursor_move', { projectId, userId, userName, x: cx, y: cy });
      }
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (isPanning) { setIsPanning(false); setPanStart(null); return; }
    if (dragging) {
      const block = blocks.find(b => b._id === dragging.blockId);
      if (block) updateBlockPos(dragging.blockId, block.position);
      setDragging(null);
    }
  };

  const handleCanvasDblClick = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-grid')) {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left - pan.x) / zoom;
      const cy = (e.clientY - rect.top - pan.y) / zoom;
      createBlock(cx, cy);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  const handleContextMenu = (e, blockId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, blockId });
  };

  const startTitleEdit = (block) => {
    setEditingId(block._id);
    setEditTitle(block.title);
  };

  const commitTitleEdit = async () => {
    if (!editingId) return;
    const blockId = editingId;
    const title = editTitle;
    setEditingId(null);
    setBlocks(prev => prev.map(b => b._id === blockId ? { ...b, title } : b));
    try {
      await api.patch(`/blocks/${blockId}`, { title });
      emit('block_updated', { projectId, blockId, changes: { title } });
    } catch (e) { console.error(e); }
  };

  const statusColor = { todo: '#6366f1', 'in-progress': '#f59e0b', review: '#8b5cf6', done: '#10b981' };
  const priorityColor = { low: '#10b981', medium: '#6366f1', high: '#f59e0b', critical: '#ef4444' };

  return (
    <div className="canvas-wrapper" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-secondary)', cursor: isPanning ? 'grabbing' : connecting ? 'crosshair' : 'default' }}>
      {/* Grid + canvas area */}
      <div
        ref={canvasRef}
        className="canvas-grid"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, var(--border-color) 1px, transparent 1px)`,
          backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDoubleClick={handleCanvasDblClick}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      >
        {/* SVG connections */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary-color)" opacity="0.7" />
            </marker>
          </defs>
          {connections.map(conn => {
            const from = blocks.find(b => b._id === (conn.fromBlockId?._id || conn.fromBlockId));
            const to = blocks.find(b => b._id === (conn.toBlockId?._id || conn.toBlockId));
            if (!from || !to) return null;
            const fx = pan.x + (from.position.x + (from.size?.width || 250) / 2) * zoom;
            const fy = pan.y + (from.position.y + (from.size?.height || 120) / 2) * zoom;
            const tx = pan.x + (to.position.x + (to.size?.width || 250) / 2) * zoom;
            const ty = pan.y + (to.position.y + (to.size?.height || 120) / 2) * zoom;
            const mx = (fx + tx) / 2;
            return (
              <path key={conn._id}
                d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`}
                stroke="var(--primary-color)" strokeWidth="2" fill="none" opacity="0.6"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>

        {/* Blocks */}
        {blocks.map(block => {
          const bx = pan.x + block.position.x * zoom;
          const by = pan.y + block.position.y * zoom;
          const bw = (block.size?.width || 250) * zoom;
          const bh = (block.size?.height || 120) * zoom;
          const isSelected = selectedId === block._id;
          const isEditing = editingId === block._id;

          return (
            <div
              key={block._id}
              style={{
                position: 'absolute', left: bx, top: by, width: bw, height: bh,
                background: 'var(--bg-card)',
                border: `${isSelected ? 2 : 1}px solid ${isSelected ? (block.color || '#6366f1') : 'var(--border-color)'}`,
                borderTop: `3px solid ${block.color || '#6366f1'}`,
                borderRadius: 10 * zoom,
                boxShadow: isSelected ? `0 0 0 3px ${block.color || '#6366f1'}33, var(--shadow-md)` : 'var(--shadow-sm)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                cursor: 'grab', userSelect: 'none',
                transition: dragging?.blockId === block._id ? 'none' : 'box-shadow 0.15s',
              }}
              onMouseDown={e => {
                if (e.button !== 0) return;
                e.stopPropagation();
                setSelectedId(block._id);
                const rect = canvasRef.current.getBoundingClientRect();
                const cx = (e.clientX - rect.left - pan.x) / zoom;
                const cy = (e.clientY - rect.top - pan.y) / zoom;
                setDragging({ blockId: block._id, offsetX: cx - block.position.x, offsetY: cy - block.position.y });
              }}
              onMouseUp={() => setDragging(null)}
              onDoubleClick={e => { e.stopPropagation(); startTitleEdit(block); }}
              onContextMenu={e => handleContextMenu(e, block._id)}
            >
              {/* Block header */}
              <div style={{ padding: `${6 * zoom}px ${10 * zoom}px`, borderBottom: `1px solid var(--border-color)`, display: 'flex', alignItems: 'center', gap: 6 * zoom, flex: '0 0 auto' }}>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={commitTitleEdit}
                    onKeyDown={e => { if (e.key === 'Enter') commitTitleEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13 * zoom, fontWeight: 700, color: 'var(--text-primary)', minWidth: 0 }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 13 * zoom, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {block.title || 'Untitled'}
                  </span>
                )}
              </div>

              {/* Block body */}
              <div style={{ flex: 1, padding: `${5 * zoom}px ${10 * zoom}px`, overflow: 'hidden' }}>
                {block.description && (
                  <p style={{ fontSize: 11 * zoom, color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {block.description}
                  </p>
                )}
              </div>

              {/* Block footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 * zoom, padding: `${4 * zoom}px ${8 * zoom}px`, borderTop: `1px solid var(--border-color)` }}>
                {block.status && (
                  <span style={{ fontSize: 9 * zoom, fontWeight: 700, textTransform: 'uppercase', background: `${statusColor[block.status] || '#6366f1'}22`, color: statusColor[block.status] || '#6366f1', padding: `${2 * zoom}px ${5 * zoom}px`, borderRadius: 20 * zoom }}>
                    {block.status}
                  </span>
                )}
                {block.priority && (
                  <span style={{ fontSize: 9 * zoom, fontWeight: 700, textTransform: 'uppercase', background: `${priorityColor[block.priority] || '#6366f1'}22`, color: priorityColor[block.priority] || '#6366f1', padding: `${2 * zoom}px ${5 * zoom}px`, borderRadius: 20 * zoom }}>
                    {block.priority}
                  </span>
                )}
                {block.tags?.slice(0, 2).map(tag => (
                  <span key={tag} style={{ fontSize: 9 * zoom, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: `${1 * zoom}px ${5 * zoom}px`, borderRadius: 20 * zoom }}>{tag}</span>
                ))}
              </div>
            </div>
          );
        })}

        {/* Live cursors */}
        {Object.entries(cursors).filter(([uid]) => uid !== userId).map(([uid, cur]) => (
          <div key={uid} style={{ position: 'absolute', left: pan.x + cur.x * zoom, top: pan.y + cur.y * zoom, pointerEvents: 'none', transform: 'translate(-2px,-2px)', zIndex: 999 }}>
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 0 L0 12 L4 9 L7 14 L9 13 L6 8 L11 8 Z" fill="#6366f1" /></svg>
            <span style={{ background: '#6366f1', color: '#fff', fontSize: 10, padding: '2px 5px', borderRadius: 4, whiteSpace: 'nowrap', display: 'block', marginTop: -2 }}>{cur.name}</span>
          </div>
        ))}
      </div>

      {/* Toolbar bottom-right */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 8, zIndex: 100 }}>
        <button className="canvas-fab" onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.15))} title="Zoom in">+</button>
        <span className="canvas-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="canvas-fab" onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - 0.15))} title="Zoom out">−</button>
        <button className="canvas-fab" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset view">⊙</button>
        <button className="canvas-fab primary" onClick={() => createBlock(300, 200)} title="Add block (Ctrl+N)">+ Block</button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', zIndex: 200, minWidth: 160, overflow: 'hidden' }}
          onMouseLeave={() => setContextMenu(null)}>
          {[
            { label: '✏️ Edit title', action: () => { const b = blocks.find(b => b._id === contextMenu.blockId); if (b) startTitleEdit(b); } },
            { label: '🗑 Delete block', action: () => deleteBlock(contextMenu.blockId), danger: true },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setContextMenu(null); }}
              style={{ display: 'block', width: '100%', padding: '0.55rem 1rem', textAlign: 'left', fontSize: 13, background: 'none', border: 'none', color: item.danger ? 'var(--error-color)' : 'var(--text-primary)', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.target.style.background = 'none'}
            >{item.label}</button>
          ))}
        </div>
      )}

      <style>{`
        .canvas-fab {
          width: 32px; height: 32px; background: var(--bg-card);
          border: 1px solid var(--border-color); border-radius: 8px;
          color: var(--text-primary); font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--shadow-sm); transition: all 0.15s;
        }
        .canvas-fab:hover { background: var(--bg-hover); border-color: var(--primary-color); }
        .canvas-fab.primary { width: auto; padding: 0 12px; font-size: 13px; font-weight: 600; background: var(--gradient-primary); color: #fff; border: none; }
        .canvas-zoom-label { display: flex; align-items: center; font-size: 12px; font-weight: 600; color: var(--text-muted); min-width: 40px; justify-content: center; }
      `}</style>
    </div>
  );
}
