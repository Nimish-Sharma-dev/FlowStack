import { createSlice } from '@reduxjs/toolkit';

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: {
    blocks: [],
    connections: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedBlockId: null,
    isConnecting: false,
    connectingFrom: null,
  },
  reducers: {
    setBlocks: (state, action) => { state.blocks = action.payload; },
    addBlock: (state, action) => { state.blocks.push(action.payload); },
    updateBlock: (state, action) => {
      const idx = state.blocks.findIndex(b => b._id === action.payload._id);
      if (idx !== -1) state.blocks[idx] = { ...state.blocks[idx], ...action.payload };
    },
    removeBlock: (state, action) => {
      state.blocks = state.blocks.filter(b => b._id !== action.payload);
    },
    setConnections: (state, action) => { state.connections = action.payload; },
    addConnection: (state, action) => { state.connections.push(action.payload); },
    removeConnection: (state, action) => {
      state.connections = state.connections.filter(c => c._id !== action.payload);
    },
    setZoom: (state, action) => { state.zoom = Math.min(3, Math.max(0.1, action.payload)); },
    setPan: (state, action) => { state.pan = action.payload; },
    setSelectedBlock: (state, action) => { state.selectedBlockId = action.payload; },
    setConnecting: (state, action) => {
      state.isConnecting = action.payload.isConnecting;
      state.connectingFrom = action.payload.fromId || null;
    },
  },
});

export const {
  setBlocks, addBlock, updateBlock, removeBlock,
  setConnections, addConnection, removeConnection,
  setZoom, setPan, setSelectedBlock, setConnecting,
} = canvasSlice.actions;
export default canvasSlice.reducer;
