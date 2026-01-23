// api/_router.js - API路由聚合（可选）
// 注意：如果使用此文件，需要在vercel.json中配置

const express = require('express');
const router = express.Router();

// 导入处理函数
const healthHandler = require('./health');
const registerHandler = require('./register');
const resolveHandler = require('./resolve');
const directoryHandler = require('./directory');

// 定义路由
router.get('/health', healthHandler);
router.post('/register', registerHandler);
router.get('/resolve', resolveHandler);
router.get('/directory', directoryHandler);

// API根路径
router.get('/', (req, res) => {
  res.json({
    name: 'AISI Registry API',
    version: '1.0.0',
    documentation: 'https://docs.aisi.run',
    endpoints: {
      health: { method: 'GET', path: '/api/health', description: '系统健康检查' },
      register: { method: 'POST', path: '/api/register', description: '注册新服务' },
      resolve: { method: 'GET', path: '/api/resolve', description: '解析服务标识符' },
      directory: { method: 'GET', path: '/api/directory', description: '获取服务目录' }
    }
  });
});

module.exports = router;
