// server.js
const express = require('express');
const path = require('path');
const app = express();

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// API路由代理（开发环境用）
app.use('/api', require('./api/_router'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AISI Registry dev server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
