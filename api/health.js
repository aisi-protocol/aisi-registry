// api/health.js - 健康检查端点
module.exports = async (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: 5,
      uptime: process.uptime(),
      message: 'AISI Registry API is operational'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
