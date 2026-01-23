// api/health.js - Vercel Serverless Function格式
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: 5,
    uptime: process.uptime(),
    message: 'AISI Registry API is operational'
  });
}
