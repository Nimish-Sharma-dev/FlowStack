import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SidebarNav({ project, onSelectBlock }) {
  const navigate = useNavigate();
  const blocks = project?.blocks || [];

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-section">
        <div className="sidebar-section-title">Blocks</div>
        {blocks.length === 0 ? (
          <p className="sidebar-empty">No blocks yet. Double-click the canvas to create one.</p>
        ) : (
          <ul className="sidebar-block-list">
            {blocks.map((b) => (
              <li
                key={b._id}
                className="sidebar-block-item"
                onClick={() => onSelectBlock && onSelectBlock(b._id)}
              >
                <span className="block-dot" style={{ background: b.color || '#6366f1' }} />
                <span className="block-item-title">{b.title || 'Untitled'}</span>
                {b.status && <span className={`block-status-dot status-${b.status}`} />}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .sidebar-nav {
          width: 220px; min-height: 100%; background: var(--bg-card);
          border-right: 1px solid var(--border-color); padding: 1rem 0.75rem;
          overflow-y: auto; flex-shrink: 0;
        }
        .sidebar-section-title {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 0.5rem;
          padding: 0 0.25rem;
        }
        .sidebar-empty { font-size: 0.78rem; color: var(--text-muted); padding: 0.25rem; line-height: 1.5; }
        .sidebar-block-list { list-style: none; display: flex; flex-direction: column; gap: 0.15rem; }
        .sidebar-block-item {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.45rem 0.5rem;
          border-radius: var(--radius-sm); cursor: pointer; font-size: 0.82rem;
          color: var(--text-secondary); transition: all var(--transition-fast);
        }
        .sidebar-block-item:hover { background: var(--bg-hover); color: var(--text-primary); }
        .block-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .block-item-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .block-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .status-done { background: #10b981; }
        .status-in-progress { background: #f59e0b; }
        .status-todo { background: #6366f1; }
        .status-review { background: #8b5cf6; }
      `}</style>
    </aside>
  );
}
