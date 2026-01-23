import { getDB } from './db.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: '方法不允许',
      allowed: ['GET']
    });
  }

  try {
    const db = await getDB();
    
    // 检查数据库连接
    const dbCheck = await db.get('SELECT 1 as ok');
    
    // 获取服务统计
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM services
    `);

    // 获取最近注册的服务
    const recentServices = await db.all(`
      SELECT id, provider, service_name, created_at
      FROM services
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const healthStatus = {
      status: 'healthy',
      registry: 'AISI Service Registry',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      region: process.env.VERCEL_REGION || 'unknown',
      
      database: {
        connected: dbCheck.ok === 1,
        path: process.env.VERCEL ? '/tmp/aisi-registry.db' : './aisi-registry.db'
      },

      services: {
        total: stats.total,
        active: stats.active,
        pending: stats.pending,
        recent: recentServices.map(s => ({
          id: s.id,
          provider: s.provider,
          name: s.service_name,
          age: Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24)) + '天'
        }))
      },

      endpoints: {
        register: { method: 'POST', url: '/api/register' },
        resolve: { method: 'GET', url: '/api/resolve?serviceId=aisi://provider/service' },
        directory: { method: 'GET', url: '/api/directory' },
        health: { method: 'GET', url: '/api/health' }
      },

      performance: {
        response_time: Date.now() - (req.headers['x-vercel-start-time'] || Date.now()),
        memory_usage: process.memoryUsage().heapUsed / 1024 / 1024 + ' MB'
      },

      links: {
        homepage: 'https://registry.aisi.run',
        github: 'https://github.com/aisi-protocol/registry',
        documentation: 'https://aisi.run/docs'
      }
    };

    res.json(healthStatus);

  } catch (error) {
    console.error('健康检查错误:', error);

    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      database: 'connection failed',
      action: 'restarting service...'
    });
  }
}
