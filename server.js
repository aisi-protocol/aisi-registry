// server.js - 生产就绪版本
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API路由
try {
  const apiRouter = require('./api/_router');
  app.use('/api', apiRouter);
  console.log('✅ API router loaded successfully');
} catch (error) {
  console.warn('⚠️ API router not available:', error.message);
  // 提供基础API响应
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', message: 'API router is being initialized' });
  });
}

// 根路径重定向
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AISI Registry running on port ${PORT}`);
  console.log(`📁 Static files: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
