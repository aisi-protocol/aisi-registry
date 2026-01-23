// api/health.js - Vercel Serverless Function
export default function handler(req, res) {
  // 设置CORS头部，允许前端访问
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 返回健康状态信息
    res.status(200).json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: 5,
      uptime: process.uptime(),
      message: 'AISI Registry API is operational',
      endpoints: [
        '/api/health',
        '/api/directory',
        '/api/resolve',
        '/api/register'
      ]
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
