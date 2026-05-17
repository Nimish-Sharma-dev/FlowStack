import { useEffect, useCallback } from 'react';

export const useKeyboard = (handlers = {}) => {
  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName;
    const isEditing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

    if (e.key === 'Escape' && handlers.onEscape) handlers.onEscape();
    if (e.key === 'Delete' && !isEditing && handlers.onDelete) handlers.onDelete();
    if (e.key === 'Backspace' && !isEditing && handlers.onDelete) handlers.onDelete();
    if (e.ctrlKey && e.key === 'n' && handlers.onNew) { e.preventDefault(); handlers.onNew(); }
    if (e.ctrlKey && e.key === 'z' && handlers.onUndo) { e.preventDefault(); handlers.onUndo(); }
    if (e.ctrlKey && e.key === 'f' && handlers.onFind) { e.preventDefault(); handlers.onFind(); }
    if (e.ctrlKey && e.key === '=' && handlers.onZoomIn) { e.preventDefault(); handlers.onZoomIn(); }
    if (e.ctrlKey && e.key === '-' && handlers.onZoomOut) { e.preventDefault(); handlers.onZoomOut(); }
    if (e.ctrlKey && e.key === '0' && handlers.onZoomReset) { e.preventDefault(); handlers.onZoomReset(); }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
