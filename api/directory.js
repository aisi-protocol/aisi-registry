// api/directory.js - 简化版先测试
module.exports = async (req, res) => {
  console.log('Directory API called:', req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // 先返回静态数据测试
  res.status(200).json({
    success: true,
    message: 'AISI Registry Directory API',
    count: 1,
    services: [
      {
        id: 1,
        service_key: "test.weather",
        service_name: "测试天气服务",
        category: "weather",
        description: "测试服务 - 数据库连接待配置"
      }
    ],
    timestamp: new Date().toISOString(),
    note: "Static response - Database integration in progress"
  });
};
