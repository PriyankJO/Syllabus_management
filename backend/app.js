const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const syllabusRoutes = require('./src/routes/syllabusRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const modelPaperRoutes = require('./src/routes/modelPaperRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const discussionRoutes = require('./src/routes/discussionRoutes');
const quizRoutes = require('./src/routes/quizRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/model-papers', modelPaperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

module.exports = app;
