/**
 * Canvas Component - Core Drawing/Editing Area
 * Handles infinite canvas, blocks, connections, and interactions
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import {
  addBlock,
  updateBlock,
  deleteBlock,
  setSelectedBlockId,
  setCanvasZoom,
  setCanvasPan,
  addConnection,
  deleteConnection,
} from '../store/slices/canvasSlice';
import Block from './Blocks/Block';
import BlockConnector from './Blocks/BlockConnector';
import '../styles/components/canvas.css';

const Canvas = ({ projectId, userId, userName }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const dispatch = useDispatch();
  const { blocks, connections, selectedBlockId, zoom, pan } = useSelector((state) => state.canvas);
  const { addNotification } = React.useContext(require('../context/NotificationContext'));

  const [socket, setSocket] = useState(null);
  const [activeCursors, setActiveCursors] = useState({});
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionFrom, setConnectionFrom] = useState(null);

  // ============ SOCKET.IO CONNECTION ============

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('✓ Connected to server');
      newSocket.emit('join_project', {
        projectId,
        userId,
        userName,
      });
    });

    // Real-time updates
    newSocket.on('block_created', (block) => {
      dispatch(addBlock(block));
    });

    newSocket.on('block_updated', ({ blockId, changes }) => {
      dispatch(updateBlock({ blockId, changes }));
    });

    newSocket.on('block_deleted', ({ blockId }) => {
      dispatch(deleteBlock(blockId));
    });

    newSocket.on('connection_created', (connection) => {
      dispatch(addConnection(connection));
    });

    newSocket.on('cursor_update', (data) => {
      setActiveCursors((prev) => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          userName: data.userName,
        },
      }));
    });

    newSocket.on('user_joined', (data) => {
      console.log(`${data.userName} joined. Total users: ${data.totalUsers}`);
    });

    newSocket.on('user_left', (data) => {
      setActiveCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leave_project', { projectId });
        newSocket.disconnect();
      }
    };
  }, [projectId, userId, userName, dispatch]);

  // ============ CANVAS INTERACTIONS ============

  // Mouse move on canvas
  const handleCanvasMouseMove = useCallback(
    (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      // Emit cursor position
      if (socket) {
        socket.emit('cursor_move', {
          projectId,
          x,
          y,
          userId,
          userName,
        });
      }

      // Update canvas pan while dragging
      if (isDraggingCanvas) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        dispatch(
          setCanvasPan({
            x: pan.x + deltaX,
            y: pan.y + deltaY,
          })
        );

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDraggingCanvas, dragStart, pan, zoom, dispatch, socket, projectId, userId, userName]
  );

  // Mouse wheel zoom
  const handleCanvasWheel = useCallback(
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const direction = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.2, Math.min(5, zoom * direction));

      dispatch(setCanvasZoom(newZoom));
    },
    [zoom, dispatch]
  );

  // Mouse down
  const handleCanvasMouseDown = (e) => {
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      // Right click or ctrl+click = pan
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Mouse up
  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Click on canvas (deselect)
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      dispatch(setSelectedBlockId(null));
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected block
      if (e.key === 'Delete' && selectedBlockId) {
        handleDeleteBlock(selectedBlockId);
      }

      // Undo (Ctrl+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        // TODO: Implement undo
      }

      // Redo (Ctrl+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        // TODO: Implement redo
      }

      // New block (Ctrl+N or Cmd+N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNewBlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId]);

  // ============ BLOCK OPERATIONS ============

  const handleCreateNewBlock = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          projectId,
          title: 'New Block',
          description: '',
        }),
      });

      if (response.ok) {
        const newBlock = await response.json();
        dispatch(addBlock(newBlock));

        if (socket) {
          socket.emit('block_created', {
            projectId,
            block: newBlock,
          });
        }
      }
    } catch (error) {
      console.error('Error creating block:', error);
      addNotification('Failed to create block', 'error');
    }
  }, [projectId, dispatch, socket, addNotification]);

  const handleUpdateBlock = useCallback(
    async (blockId, updates) => {
      try {
        const response = await fetch(`http://localhost:5000/api/blocks/${blockId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const updatedBlock = await response.json();
          dispatch(updateBlock({ blockId, changes: updates }));

          if (socket) {
            socket.emit('block_updated', {
              projectId,
              blockId,
              changes: updates,
            });
          }
        }
      } catch (error) {
        console.error('Error updating block:', error);
      }
    },
    [projectId, dispatch, socket]
  );

  const handleDeleteBlock = useCallback(
    async (blockId) => {
      try {
        const response = await fetch(`http://localhost:5000/api/blocks/${blockId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          dispatch(deleteBlock(blockId));

          if (socket) {
            socket.emit('block_deleted', {
              projectId,
              blockId,
            });
          }

          addNotification('Block deleted', 'success');
        }
      } catch (error) {
        console.error('Error deleting block:', error);
        addNotification('Failed to delete block', 'error');
      }
    },
    [projectId, dispatch, socket, addNotification]
  );

  // ============ CANVAS RENDERING ============

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onMouseMove={handleCanvasMouseMove}
      onMouseDown={handleCanvasMouseDown}
      onMouseUp={handleCanvasMouseUp}
      onWheel={handleCanvasWheel}
      onClick={handleCanvasClick}
    >
      <svg
        ref={canvasRef}
        className="canvas-background"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="10000" height="10000" fill="url(#grid)" />

        {/* Connections */}
        {connections &&
          connections.map((connection) => (
            <BlockConnector
              key={connection._id}
              connection={connection}
              blocks={blocks}
              onDelete={() => {
                dispatch(deleteConnection(connection._id));
                if (socket) {
                  socket.emit('connection_deleted', {
                    projectId,
                    connectionId: connection._id,
                  });
                }
              }}
            />
          ))}
      </svg>

      {/* Blocks */}
      <div className="canvas-content" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        {blocks &&
          blocks.map((block) => (
            <Block
              key={block._id}
              block={block}
              isSelected={selectedBlockId === block._id}
              onSelect={() => dispatch(setSelectedBlockId(block._id))}
              onUpdate={(updates) => handleUpdateBlock(block._id, updates)}
              onDelete={() => handleDeleteBlock(block._id)}
              onConnectionStart={() => {
                setConnectionMode(true);
                setConnectionFrom(block._id);
              }}
            />
          ))}
      </div>

      {/* Active cursors */}
      {Object.entries(activeCursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="active-cursor"
          style={{
            left: `${cursor.x * zoom + pan.x}px`,
            top: `${cursor.y * zoom + pan.y}px`,
          }}
        >
          <div className="cursor-pointer"></div>
          <div className="cursor-label">{cursor.userName}</div>
        </div>
      ))}

      {/* Floating toolbar */}
      <div className="canvas-toolbar">
        <button
          className="toolbar-btn"
          onClick={handleCreateNewBlock}
          title="Create new block (Ctrl+N)"
        >
          <span>+</span> Add Block
        </button>
        <button
          className="toolbar-btn"
          onClick={() => dispatch(setCanvasZoom(1))}
          title="Zoom to 100%"
        >
          🔍 Reset Zoom
        </button>
        <button className="toolbar-btn" title="Fit all blocks">
          ⬆️ Fit All
        </button>
      </div>
    </div>
  );
};

export default Canvas;
