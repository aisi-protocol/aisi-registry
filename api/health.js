// api/health.js - 使用Vercel要求的格式
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: 5
  });
}
