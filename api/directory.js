// api/directory.js
export default function handler(req, res) {
  const services = [
    {
      id: 'heweather_001',
      serviceId: 'aisi://heweather/current-weather',
      endpoint: 'https://devapi.qweather.com/v7/weather/now',
      providerName: '和风天气',
      description: '获取实时天气数据',
      category: 'weather'
    }
    // ... 保持其他示例数据
  ];
  
  res.status(200).json({
    total: services.length,
    services,
    categories: ['weather', 'news', 'finance', 'tools', 'ai']
  });
}
