import React, { useState } from 'react';
import api from '../../services/api';

const STATUSES = ['todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'tough'];
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6'];

export default function RightPanel({ block, onUpdate, onClose }) {
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(block || {});

  React.useEffect(() => { setLocal(block || {}); }, [block]);

  if (!block) return (
    <aside className="right-panel right-panel-empty">
      <p>Select a block to view properties</p>
      <style>{`.right-panel-empty { display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.875rem; }`}</style>
    </aside>
  );

  const save = async (field, value) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    setSaving(true);
    try {
      const res = await api.patch(`/blocks/${block._id}`, { [field]: value });
      if (onUpdate) onUpdate(res.data);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <aside className="right-panel">
      <div className="rp-header">
        <span className="rp-title">Properties</span>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>

      <div className="rp-body">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            value={local.title || ''}
            onChange={e => setLocal(p => ({ ...p, title: e.target.value }))}
            onBlur={e => save('title', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description (Short)</label>
          <textarea
            rows={2}
            value={local.description || ''}
            onChange={e => setLocal(p => ({ ...p, description: e.target.value }))}
            onBlur={e => save('description', e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Full Content</label>
          <textarea
            rows={6}
            value={local.content || ''}
            onChange={e => setLocal(p => ({ ...p, content: e.target.value }))}
            onBlur={e => save('content', e.target.value)}
            style={{ resize: 'vertical' }}
            placeholder="Add detailed content..."
          />
        </div>

        <div className="rp-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Status</label>
            <select value={local.status || 'todo'} onChange={e => save('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Priority</label>
            <select value={local.priority || ''} onChange={e => save('priority', e.target.value)}>
              <option value="">None</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        
        <div className="rp-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Difficulty</label>
            <select value={local.difficulty || ''} onChange={e => save('difficulty', e.target.value)}>
              <option value="">None</option>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${local.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => save('color', c)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date & Time</label>
          <input
            type="datetime-local"
            value={local.deadline ? new Date(local.deadline).toISOString().slice(0, 16) : ''}
            onChange={e => save('deadline', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags (comma separated)</label>
          <input
            value={(local.tags || []).join(', ')}
            onChange={e => setLocal(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
            onBlur={e => save('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
            placeholder="design, backend, urgent"
          />
        </div>

        {saving && <div className="rp-saving">Saving…</div>}
      </div>

      <style>{`
        .right-panel {
          width: 260px; min-height: 100%; background: var(--bg-card);
          border-left: 1px solid var(--border-color); display: flex; flex-direction: column; flex-shrink: 0;
        }
        .rp-header { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; border-bottom:1px solid var(--border-color); }
        .rp-title { font-weight:700; font-size:0.875rem; color:var(--text-primary); }
        .rp-body { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:0.1rem; }
        .rp-row { display:flex; gap:0.75rem; }
        .color-picker { display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.2rem; }
        .color-swatch { width:22px; height:22px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:transform var(--transition-fast); }
        .color-swatch:hover { transform:scale(1.2); }
        .color-swatch.active { border-color: var(--text-primary); transform:scale(1.15); }
        .rp-saving { font-size:0.75rem; color:var(--text-muted); text-align:right; }
      `}</style>
    </aside>
  );
}
