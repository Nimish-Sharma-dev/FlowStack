/**
 * Visual Workspace Platform - Backend Server
 * Main server file with Express and Socket.io setup
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// ============ SOCKET.IO SETUP ============
const io = socketIo(server, {
  cors: {
    origin: process.env.SOCKET_IO_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
});

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.SOCKET_IO_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(compression());

// ============ DATABASE CONNECTION ============
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/visual-workspace', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ============ MODELS ============

// User Model
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: String,
    avatar: String,
    preferences: {
      theme: { type: String, default: 'light' },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Project Model
const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamMembers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'editor' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
    visibility: { type: String, enum: ['private', 'team', 'public'], default: 'private' },
    thumbnail: String,
    shareToken: String,
    shareExpires: Date,
    activityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Block Model
const blockSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    parentId: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    description: String,
    content: String,
    notes: String,
    checklists: [
      {
        id: String,
        text: String,
        completed: Boolean,
      },
    ],
    attachments: [
      {
        id: String,
        filename: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    tags: [String],
    color: { type: String, default: '#3B82F6' },
    icon: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
    deadline: Date,
    position: { x: Number, y: Number },
    size: { width: Number, height: Number },
    isCollapsed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }],
  },
  { timestamps: true }
);

// Connection Model (for connections between blocks)
const connectionSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    fromBlockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
    toBlockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
    connectionType: { type: String, default: 'arrow' }, // arrow, line, curve, etc.
    label: String,
  },
  { timestamps: true }
);

// Comment Model
const commentSchema = new mongoose.Schema(
  {
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Activity Log Model
const activityLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'created_block',
      'updated_block',
      'deleted_block',
      'created_connection',
      'deleted_connection',
      'added_comment',
      'updated_project',
      'added_member',
      'removed_member',
      'changed_permission',
    ],
  },
  blockId: mongoose.Schema.Types.ObjectId,
  changes: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Version Model (for version history)
const versionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  snapshotData: mongoose.Schema.Types.Mixed,
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  isRecovery: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Block = mongoose.model('Block', blockSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Comment = mongoose.model('Comment', commentSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
const Version = mongoose.model('Version', versionSchema);

// ============ MIDDLEWARE: AUTH TOKEN VERIFICATION ============

const jwt = require('jsonwebtoken');

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
  } catch (err) {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// ============ ROUTES ============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AUTH ROUTES
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev-secret-key', {
      expiresIn: '7d',
    });

    res.status(201).json({
      user: { _id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET || 'dev-secret-key', {
      expiresIn: '7d',
    });

    res.json({
      user: { _id: user._id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET CURRENT USER
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROJECT ROUTES
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ ownerId: req.user._id }, { 'teamMembers.userId': req.user._id }],
    })
      .populate('ownerId', 'name email avatar')
      .populate('teamMembers.userId', 'name email avatar')
      .sort({ activityAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, visibility } = req.body;

    const project = new Project({
      name,
      description,
      ownerId: req.user._id,
      visibility: visibility || 'private',
      teamMembers: [{ userId: req.user._id, role: 'owner' }],
    });

    await project.save();

    // Create root block
    const rootBlock = new Block({
      projectId: project._id,
      title: name,
      description: description || '',
      createdBy: req.user._id,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 150 },
    });

    await rootBlock.save();
    project.blocks.push(rootBlock._id);
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('blocks')
      .populate('connections')
      .populate('ownerId', 'name email avatar')
      .populate('teamMembers.userId', 'name email avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const isMember =
      project.ownerId._id.equals(req.user._id) ||
      project.teamMembers.some((m) => m.userId._id.equals(req.user._id));

    if (!isMember && project.visibility !== 'public') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BLOCK ROUTES
app.post('/api/blocks', authMiddleware, async (req, res) => {
  try {
    const { projectId, parentId, title, description } = req.body;

    const block = new Block({
      projectId,
      parentId,
      title,
      description,
      createdBy: req.user._id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      size: { width: 250, height: 120 },
    });

    await block.save();

    // Add to parent's children
    if (parentId) {
      await Block.findByIdAndUpdate(parentId, {
        $push: { children: block._id },
      });
    }

    // Add to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { blocks: block._id },
      activityAt: new Date(),
    });

    // Log activity
    const activityLog = new ActivityLog({
      projectId,
      userId: req.user._id,
      action: 'created_block',
      blockId: block._id,
    });
    await activityLog.save();

    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/blocks/:blockId', authMiddleware, async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(req.params.blockId, req.body, { new: true });

    // Log activity
    const activityLog = new ActivityLog({
      projectId: block.projectId,
      userId: req.user._id,
      action: 'updated_block',
      blockId: block._id,
      changes: req.body,
    });
    await activityLog.save();

    res.json(block);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/blocks/:blockId', authMiddleware, async (req, res) => {
  try {
    const block = await Block.findByIdAndDelete(req.params.blockId);

    // Remove from project
    await Project.findByIdAndUpdate(block.projectId, {
      $pull: { blocks: block._id },
      activityAt: new Date(),
    });

    // Remove from parent's children
    if (block.parentId) {
      await Block.findByIdAndUpdate(block.parentId, {
        $pull: { children: block._id },
      });
    }

    // Log activity
    const activityLog = new ActivityLog({
      projectId: block.projectId,
      userId: req.user._id,
      action: 'deleted_block',
      blockId: block._id,
    });
    await activityLog.save();

    res.json({ message: 'Block deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTIVITY LOG ROUTES
app.get('/api/projects/:projectId/activity', authMiddleware, async (req, res) => {
  try {
    const activities = await ActivityLog.find({ projectId: req.params.projectId })
      .populate('userId', 'name email avatar')
      .populate('blockId', 'title')
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEARCH ROUTES
app.get('/api/projects/:projectId/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const results = await Block.find({
      projectId: req.params.projectId,
      $or: [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }],
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SOCKET.IO SETUP ============

const activeUsers = new Map(); // Track active users per project

io.on('connection', (socket) => {
  console.log(`🔗 Client connected: ${socket.id}`);

  // User joined project
  socket.on('join_project', (data) => {
    const { projectId, userId, userName } = data;
    socket.join(`project:${projectId}`);

    if (!activeUsers.has(projectId)) {
      activeUsers.set(projectId, []);
    }

    activeUsers.get(projectId).push({
      socketId: socket.id,
      userId,
      userName,
      cursor: { x: 0, y: 0 },
      joinedAt: new Date(),
    });

    // Broadcast user joined
    io.to(`project:${projectId}`).emit('user_joined', {
      userId,
      userName,
      totalUsers: activeUsers.get(projectId).length,
    });
  });

  // Cursor movement
  socket.on('cursor_move', (data) => {
    const { projectId, x, y, userId, userName } = data;

    socket.broadcast.to(`project:${projectId}`).emit('cursor_update', {
      userId,
      userName,
      x,
      y,
    });
  });

  // Block created
  socket.on('block_created', (data) => {
    const { projectId, block } = data;
    io.to(`project:${projectId}`).emit('block_created', block);
  });

  // Block updated
  socket.on('block_updated', (data) => {
    const { projectId, blockId, changes } = data;
    socket.broadcast.to(`project:${projectId}`).emit('block_updated', {
      blockId,
      changes,
    });
  });

  // Block deleted
  socket.on('block_deleted', (data) => {
    const { projectId, blockId } = data;
    io.to(`project:${projectId}`).emit('block_deleted', { blockId });
  });

  // Connection created
  socket.on('connection_created', (data) => {
    const { projectId, connection } = data;
    io.to(`project:${projectId}`).emit('connection_created', connection);
  });

  // Comment added
  socket.on('comment_added', (data) => {
    const { projectId, blockId, comment } = data;
    io.to(`project:${projectId}`).emit('comment_added', {
      blockId,
      comment,
    });
  });

  // User left project
  socket.on('leave_project', (data) => {
    const { projectId } = data;
    socket.leave(`project:${projectId}`);

    if (activeUsers.has(projectId)) {
      const users = activeUsers.get(projectId);
      const index = users.findIndex((u) => u.socketId === socket.id);
      if (index > -1) {
        const user = users.splice(index, 1)[0];
        io.to(`project:${projectId}`).emit('user_left', {
          userId: user.userId,
          userName: user.userName,
          totalUsers: users.length,
        });
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);

    // Remove user from all projects
    for (const [projectId, users] of activeUsers.entries()) {
      const index = users.findIndex((u) => u.socketId === socket.id);
      if (index > -1) {
        const user = users.splice(index, 1)[0];
        io.to(`project:${projectId}`).emit('user_left', {
          userId: user.userId,
          userName: user.userName,
          totalUsers: users.length,
        });
      }
    }
  });
});

// ============ ERROR HANDLING ============

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Visual Workspace Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server: http://localhost:${PORT}
🗄️  Database: ${process.env.MONGO_URI || 'mongodb://localhost:27017/visual-workspace'}
🔌 Socket.io: Ready for real-time connections
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

module.exports = { app, io, server };
