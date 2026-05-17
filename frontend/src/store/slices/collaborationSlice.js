import { createSlice } from '@reduxjs/toolkit';

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState: { activeUsers: [], comments: [] },
  reducers: {
    setActiveUsers: (state, action) => { state.activeUsers = action.payload; },
    addActiveUser: (state, action) => {
      const exists = state.activeUsers.find(u => u.userId === action.payload.userId);
      if (!exists) state.activeUsers.push(action.payload);
    },
    removeActiveUser: (state, action) => {
      state.activeUsers = state.activeUsers.filter(u => u.userId !== action.payload);
    },
    updateCursor: (state, action) => {
      const user = state.activeUsers.find(u => u.userId === action.payload.userId);
      if (user) { user.cursor = { x: action.payload.x, y: action.payload.y }; }
    },
    setComments: (state, action) => { state.comments = action.payload; },
    addComment: (state, action) => { state.comments.push(action.payload); },
  },
});

export const { setActiveUsers, addActiveUser, removeActiveUser, updateCursor, setComments, addComment } = collaborationSlice.actions;
export default collaborationSlice.reducer;
