// api/test.js - 极简测试，无数据库依赖
export default function handler(req, res) {
  console.log('Test endpoint called at:', new Date().toISOString());
  
  return res.status(200).json({
    success: true,
    message: 'AISI Registry API Test Endpoint',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    nodeVersion: process.version
  });
}
