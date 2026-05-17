/**
 * Redux Store Setup
 * Global state management for the application
 */

// ============ store.js ============

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectSlice from './slices/projectSlice';
import canvasSlice from './slices/canvasSlice';
import blocksSlice from './slices/blocksSlice';
import collaborationSlice from './slices/collaborationSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    project: projectSlice,
    canvas: canvasSlice,
    blocks: blocksSlice,
    collaboration: collaborationSlice,
    ui: uiSlice,
  },
});

// ============ slices/authSlice.js ============

import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    token: localStorage.getItem('token') || null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setToken, logout, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer;

// ============ slices/projectSlice.js ============

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
    },
    addTeamMember: (state, action) => {
      if (state.currentProject) {\n        state.currentProject.teamMembers.push(action.payload);\n      }\n    },\n    removeTeamMember: (state, action) => {\n      if (state.currentProject) {\n        state.currentProject.teamMembers = state.currentProject.teamMembers.filter(\n          (m) => m.userId !== action.payload\n        );\n      }\n    },\n  },\n});\n\nexport const { setProjects, setCurrentProject, addProject, updateProject, deleteProject, addTeamMember, removeTeamMember } = projectSlice.actions;\nexport default projectSlice.reducer;\n\n// ============ slices/canvasSlice.js ============\n\nconst canvasSlice = createSlice({\n  name: 'canvas',\n  initialState: {\n    blocks: [],\n    connections: [],\n    selectedBlockId: null,\n    selectedConnectionId: null,\n    zoom: 1,\n    pan: { x: 0, y: 0 },\n  },\n  reducers: {\n    setBlocks: (state, action) => {\n      state.blocks = action.payload;\n    },\n    addBlock: (state, action) => {\n      state.blocks.push(action.payload);\n    },\n    updateBlock: (state, action) => {\n      const { blockId, changes } = action.payload;\n      const block = state.blocks.find((b) => b._id === blockId);\n      if (block) {\n        Object.assign(block, changes);\n      }\n    },\n    deleteBlock: (state, action) => {\n      state.blocks = state.blocks.filter((b) => b._id !== action.payload);\n    },\n    setConnections: (state, action) => {\n      state.connections = action.payload;\n    },\n    addConnection: (state, action) => {\n      state.connections.push(action.payload);\n    },\n    deleteConnection: (state, action) => {\n      state.connections = state.connections.filter((c) => c._id !== action.payload);\n    },\n    setSelectedBlockId: (state, action) => {\n      state.selectedBlockId = action.payload;\n    },\n    setCanvasZoom: (state, action) => {\n      state.zoom = action.payload;\n    },\n    setCanvasPan: (state, action) => {\n      state.pan = action.payload;\n    },\n  },\n});\n\nexport const {\n  setBlocks,\n  addBlock,\n  updateBlock,\n  deleteBlock,\n  setConnections,\n  addConnection,\n  deleteConnection,\n  setSelectedBlockId,\n  setCanvasZoom,\n  setCanvasPan,\n} = canvasSlice.actions;\nexport default canvasSlice.reducer;\n\n// ============ slices/blocksSlice.js ============\n\nconst blocksSlice = createSlice({\n  name: 'blocks',\n  initialState: {\n    blockDetails: {}, // blockId -> full details\n  },\n  reducers: {\n    setBlockDetails: (state, action) => {\n      const { blockId, details } = action.payload;\n      state.blockDetails[blockId] = details;\n    },\n    updateBlockDetails: (state, action) => {\n      const { blockId, updates } = action.payload;\n      if (state.blockDetails[blockId]) {\n        Object.assign(state.blockDetails[blockId], updates);\n      }\n    },\n  },\n});\n\nexport const { setBlockDetails, updateBlockDetails } = blocksSlice.actions;\nexport default blocksSlice.reducer;\n\n// ============ slices/collaborationSlice.js ============\n\nconst collaborationSlice = createSlice({\n  name: 'collaboration',\n  initialState: {\n    activeUsers: [],\n    comments: {}, // blockId -> comments array\n    mentions: [],\n  },\n  reducers: {\n    setActiveUsers: (state, action) => {\n      state.activeUsers = action.payload;\n    },\n    addActiveUser: (state, action) => {\n      state.activeUsers.push(action.payload);\n    },\n    removeActiveUser: (state, action) => {\n      state.activeUsers = state.activeUsers.filter((u) => u.userId !== action.payload);\n    },\n    setComments: (state, action) => {\n      const { blockId, comments } = action.payload;\n      state.comments[blockId] = comments;\n    },\n    addComment: (state, action) => {\n      const { blockId, comment } = action.payload;\n      if (!state.comments[blockId]) {\n        state.comments[blockId] = [];\n      }\n      state.comments[blockId].push(comment);\n    },\n  },\n});\n\nexport const { setActiveUsers, addActiveUser, removeActiveUser, setComments, addComment } = collaborationSlice.actions;\nexport default collaborationSlice.reducer;\n\n// ============ slices/uiSlice.js ============\n\nconst uiSlice = createSlice({\n  name: 'ui',\n  initialState: {\n    sidebarOpen: true,\n    rightPanelOpen: true,\n    theme: localStorage.getItem('theme') || 'light',\n    notifications: [],\n    modals: {\n      shareModal: false,\n      exportModal: false,\n      versionHistory: false,\n      search: false,\n    },\n  },\n  reducers: {\n    toggleSidebar: (state) => {\n      state.sidebarOpen = !state.sidebarOpen;\n    },\n    toggleRightPanel: (state) => {\n      state.rightPanelOpen = !state.rightPanelOpen;\n    },\n    setTheme: (state, action) => {\n      state.theme = action.payload;\n      localStorage.setItem('theme', action.payload);\n    },\n    openModal: (state, action) => {\n      state.modals[action.payload] = true;\n    },\n    closeModal: (state, action) => {\n      state.modals[action.payload] = false;\n    },\n  },\n});\n\nexport const { toggleSidebar, toggleRightPanel, setTheme, openModal, closeModal } = uiSlice.actions;\nexport default uiSlice.reducer;\n