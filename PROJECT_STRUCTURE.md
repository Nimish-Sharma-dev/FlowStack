# Collaborative Visual Workspace Platform - Complete Project Structure

## Directory Architecture

```
visual-workspace-platform/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   ├── constants.js
│   │   └── cors.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Block.js
│   │   ├── Connection.js
│   │   ├── Comment.js
│   │   ├── ActivityLog.js
│   │   ├── Version.js
│   │   ├── Permission.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── projects.routes.js
│   │   ├── blocks.routes.js
│   │   ├── collaborate.routes.js
│   │   ├── permissions.routes.js
│   │   ├── activity.routes.js
│   │   └── search.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── blockController.js
│   │   ├── collaborateController.js
│   │   ├── activityController.js
│   │   └── searchController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── projectService.js
│   │   ├── collaborationService.js
│   │   ├── aiService.js
│   │   ├── versionService.js
│   │   └── notificationService.js
│   ├── websocket/
│   │   ├── socketManager.js
│   │   ├── eventHandlers/
│   │   │   ├── cursorEvents.js
│   │   │   ├── blockEvents.js
│   │   │   ├── commentEvents.js
│   │   │   └── presenceEvents.js
│   │   └── namespaces/
│   │       └── projectNamespace.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   ├── fileUpload.js
│   │   └── logger.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── SidebarNav.jsx
│   │   │   │   ├── TopToolbar.jsx
│   │   │   │   ├── RightPanel.jsx
│   │   │   │   └── MiniMap.jsx
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.jsx
│   │   │   │   ├── CanvasGrid.jsx
│   │   │   │   ├── CanvasZoom.jsx
│   │   │   │   ├── SelectionBox.jsx
│   │   │   │   └── ContextMenu.jsx
│   │   │   ├── Blocks/
│   │   │   │   ├── Block.jsx
│   │   │   │   ├── BlockContent.jsx
│   │   │   │   ├── BlockConnector.jsx
│   │   │   │   ├── BlockToolbox.jsx
│   │   │   │   └── BlockProperties.jsx
│   │   │   ├── Collaboration/
│   │   │   │   ├── LiveCursor.jsx
│   │   │   │   ├── PresenceIndicator.jsx
│   │   │   │   ├── CollaborationNotif.jsx
│   │   │   │   └── PermissionBadge.jsx
│   │   │   ├── Landing/
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   ├── AnimatedGraph.jsx
│   │   │   │   └── CTASection.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ProjectGrid.jsx
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── CreateProjectModal.jsx
│   │   │   │   └── QuickStats.jsx
│   │   │   ├── Editor/
│   │   │   │   ├── RichTextEditor.jsx
│   │   │   │   ├── ChecklistEditor.jsx
│   │   │   │   ├── NotesEditor.jsx
│   │   │   │   └── TagEditor.jsx
│   │   │   ├── Comments/
│   │   │   │   ├── CommentThread.jsx
│   │   │   │   ├── CommentInput.jsx
│   │   │   │   └── CommentReply.jsx
│   │   │   ├── Modals/
│   │   │   │   ├── ShareModal.jsx
│   │   │   │   ├── PermissionModal.jsx
│   │   │   │   ├── ExportModal.jsx
│   │   │   │   ├── VersionHistoryModal.jsx
│   │   │   │   └── SearchModal.jsx
│   │   │   └── Common/
│   │   │       ├── Button.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Avatar.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── Loading.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── Dropdown.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useCanvas.js
│   │   │   ├── useSocket.js
│   │   │   ├── useAuth.js
│   │   │   ├── useProject.js
│   │   │   ├── useBlocks.js
│   │   │   ├── useSelection.js
│   │   │   └── useKeyboard.js
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── projectSlice.js
│   │   │   │   ├── canvasSlice.js
│   │   │   │   ├── blocksSlice.js
│   │   │   │   ├── collaborationSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   ├── store.js
│   │   │   └── middleware/
│   │   │       └── socketMiddleware.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── socketService.js
│   │   │   ├── storageService.js
│   │   │   ├── exportService.js
│   │   │   └── themeService.js
│   │   ├── utils/
│   │   │   ├── canvas.utils.js
│   │   │   ├── geometry.js
│   │   │   ├── keyboard.js
│   │   │   ├── validators.js
│   │   │   ├── formatting.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   ├── animations.css
│   │   │   ├── themes/
│   │   │   │   ├── light.css
│   │   │   │   ├── dark.css
│   │   │   │   └── glassmorphism.css
│   │   │   └── components/
│   │   │       ├── canvas.css
│   │   │       ├── blocks.css
│   │   │       ├── toolbar.css
│   │   │       └── modals.css
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── context/
│   │       ├── AuthContext.jsx
│   │       ├── ThemeContext.jsx
│   │       └── NotificationContext.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── index.html
│
├── shared/
│   ├── types/
│   │   ├── project.types.ts
│   │   ├── block.types.ts
│   │   ├── user.types.ts
│   │   ├── collaboration.types.ts
│   │   └── api.types.ts
│   ├── constants/
│   │   ├── blockTypes.js
│   │   ├── permissions.js
│   │   ├── events.js
│   │   └── validation.js
│   └── utils/
│       ├── geometry.js
│       └── validators.js
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── FEATURES.md
│   └── DEVELOPMENT.md
│
├── .gitignore
├── .prettierrc
├── .eslintrc
├── README.md
└── package.json (root)
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT + bcrypt
- **Validation**: Joi/Zod
- **File Storage**: AWS S3 / Local storage
- **Caching**: Redis
- **Task Queue**: Bull/Bee-Queue

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Canvas Rendering**: Konva.js or Custom Canvas API
- **Real-time**: Socket.io-client
- **HTTP Client**: Axios
- **Rich Text**: TipTap / Slate
- **UI Components**: Headless UI + Tailwind CSS
- **Icons**: Lucide React / Feather Icons
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (Frontend) / Railway/Render (Backend)

## Key Features Implementation Order

1. **Phase 1**: Authentication, Landing Page, Basic Dashboard
2. **Phase 2**: Canvas Core, Block Creation, Basic Drawing
3. **Phase 3**: Real-time Collaboration, WebSocket Integration
4. **Phase 4**: Comments, Permissions, Sharing
5. **Phase 5**: Version History, Activity Logs
6. **Phase 6**: Advanced Features (AI, Export, Templates)
7. **Phase 7**: Performance Optimization, Polish

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/visual-workspace
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
SOCKET_IO_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_ENV=development
```

## Database Collections Schema

### Users
- _id, email, password, name, avatar, preferences, createdAt, updatedAt

### Projects
- _id, name, description, ownerId, teamId, thumbnail, visibility, blocks, connections, createdAt, updatedAt, activityAt

### Blocks
- _id, projectId, parentId, title, description, content, notes, checklists, attachments, tags, color, icon, priority, status, deadline, position, size, createdBy, createdAt, updatedAt

### Connections
- _id, projectId, fromBlockId, toBlockId, connectionType, label, createdAt

### Comments
- _id, blockId, projectId, authorId, content, mentions, createdAt, updatedAt, replies[]

### ActivityLog
- _id, projectId, userId, action, blockId, changes, timestamp

### Versions
- _id, projectId, snapshotData, creatorId, message, createdAt, isRecovery
