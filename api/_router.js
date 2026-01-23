// api/_router.js - API路由聚合器
const express = require('express');
const router = express.Router();
const path = require('path');

// 动态加载API模块，带错误处理
const loadApiModule = (modulePath) => {
  try {
    return require(modulePath);
  } catch (error) {
    console.error(`❌ Failed to load API module: ${modulePath}`, error.message);
    // 返回一个降级处理函数
    return (req, res) => {
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        module: path.basename(modulePath, '.js'),
        message: 'Module is initializing'
      });
    };
  }
};

// 健康检查
router.get('/health', loadApiModule('./health'));

// 服务注册
router.post('/register', loadApiModule('./register'));

// 服务解析
router.get('/resolve', loadApiModule('./resolve'));

// 服务目录
router.get('/directory', loadApiModule('./directory'));

// API根路径
router.get('/', (req, res) => {
  res.json({
    name: 'AISI Registry API',
    version: '1.0.0',
    endpoints: [
      { path: '/health', method: 'GET', description: '服务健康检查' },
      { path: '/register', method: 'POST', description: '注册新服务' },
      { path: '/resolve', method: 'GET', description: '解析服务标识符' },
      { path: '/directory', method: 'GET', description: '获取服务目录' }
    ]
  });
});

module.exports = router;
