import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    rightPanelOpen: false,
    activeModal: null,
    theme: 'dark',
    isMobile: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    toggleRightPanel: (state) => { state.rightPanelOpen = !state.rightPanelOpen; },
    setRightPanelOpen: (state, action) => { state.rightPanelOpen = action.payload; },
    setActiveModal: (state, action) => { state.activeModal = action.payload; },
    setTheme: (state, action) => { state.theme = action.payload; },
    setIsMobile: (state, action) => { state.isMobile = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleRightPanel, setRightPanelOpen, setActiveModal, setTheme, setIsMobile } = uiSlice.actions;
export default uiSlice.reducer;
