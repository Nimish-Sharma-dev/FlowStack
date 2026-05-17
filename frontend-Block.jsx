/**
 * Block Component - Individual block/node on canvas
 * Handles block rendering, editing, and interactions
 */

import React, { useState, useRef } from 'react';
import '../styles/components/blocks.css';

const Block = ({ block, isSelected, onSelect, onUpdate, onDelete, onConnectionStart }) => {
  const blockRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [titleValue, setTitleValue] = useState(block.title);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only

    e.stopPropagation();
    onSelect();

    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    onUpdate({
      position: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Edit title
  const handleTitleChange = (e) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    if (titleValue !== block.title) {
      onUpdate({ title: titleValue });
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTitleValue(block.title);
      setIsEditing(false);
    }
  };

  // Resize handler
  const handleResizeMouseDown = (e) => {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = blockRef.current.offsetWidth;
    const startHeight = blockRef.current.offsetHeight;

    const handleResizeMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      onUpdate({
        size: {
          width: Math.max(200, startWidth + deltaX),
          height: Math.max(120, startHeight + deltaY),
        },
      });
    };

    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div
      ref={blockRef}
      className={`block ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${block.position?.x || 0}px`,
        top: `${block.position?.y || 0}px`,
        width: `${block.size?.width || 250}px`,
        height: `${block.size?.height || 120}px`,
        backgroundColor: block.color || '#3B82F6',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="block-header">
        {block.icon && <span className="block-icon">{block.icon}</span>}

        {isEditing ? (
          <input
            type="text"
            className="block-title-input"
            value={titleValue}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h3 className="block-title" onDoubleClick={() => setIsEditing(true)}>
            {block.title}
          </h3>
        )}

        {/* Status badge */}
        {block.status && <span className={`status-badge status-${block.status}`}>{block.status}</span>}

        {/* Priority badge */}
        {block.priority && (
          <span className={`priority-badge priority-${block.priority}`}>
            {block.priority.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Menu button */}
        <button
          className="block-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
        >
          ⋮
        </button>
      </div>

      {/* Content */}
      <div className="block-content">
        {block.description && <p className="block-description">{block.description}</p>}

        {block.tags && block.tags.length > 0 && (
          <div className="block-tags">
            {block.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Checklists */}
        {block.checklists && block.checklists.length > 0 && (
          <div className="block-checklists">
            <div className="checklist-progress">
              {block.checklists.filter((item) => item.completed).length} /{' '}
              {block.checklists.length} done
            </div>
            <div className="checklist-bar">
              <div
                className="checklist-progress-bar"\n                style={{\n                  width: `${(\n                    (block.checklists.filter((item) => item.completed).length /\n                      block.checklists.length) *\n                    100\n                  ).toFixed(0)}%`,\n                }}\n              ></div>\n            </div>\n          </div>\n        )}\n      </div>\n\n      {/* Deadline */}\n      {block.deadline && (\n        <div className=\"block-deadline\">\n          📅 {new Date(block.deadline).toLocaleDateString()}\n        </div>\n      )}\n\n      {/* Options menu */}\n      {showOptions && (\n        <div className=\"block-options-menu\">\n          <button onClick={() => setIsEditing(true)}>Edit Title</button>\n          <button onClick={onConnectionStart}>Connect</button>\n          <button className=\"btn-danger\" onClick={onDelete}>\n            Delete\n          </button>\n        </div>\n      )}\n\n      {/* Connection points */}\n      <div className=\"connection-points\">\n        <div className=\"connection-point connection-point-top\" title=\"Connect from top\" />\n        <div className=\"connection-point connection-point-right\" title=\"Connect from right\" />\n        <div className=\"connection-point connection-point-bottom\" title=\"Connect from bottom\" />\n        <div className=\"connection-point connection-point-left\" title=\"Connect from left\" />\n      </div>\n\n      {/* Resize handle */}\n      <div className=\"block-resize-handle\" onMouseDown={handleResizeMouseDown} />\n    </div>\n  );\n};\n\nexport default Block;\n