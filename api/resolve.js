// api/resolve.js - 解析服务标识符
module.exports = async (req, res) => {
  try {
    const { serviceId } = req.query;
    
    if (!serviceId) {
      return res.status(400).json({ 
        error: 'Missing parameter',
        message: 'serviceId query parameter is required' 
      });
    }
    
    // 验证serviceId格式
    if (!serviceId.startsWith('aisi://')) {
      return res.status(400).json({ 
        error: 'Invalid format',
        message: 'Service ID must start with aisi://' 
      });
    }
    
    // 这里是模拟数据 - 实际应该查询数据库
    const serviceMap = {
      'aisi://heweather/current-weather': {
        id: 'heweather_001',
        serviceId: 'aisi://heweather/current-weather',
        endpoint: 'https://devapi.qweather.com/v7/weather/now',
        providerName: '和风天气',
        description: '获取实时天气数据',
        category: 'weather',
        inputSchema: {
          location: { type: 'string', required: true },
          unit: { type: 'string', enum: ['c', 'f'], default: 'c' }
        },
        outputSchema: {
          temp: { type: 'number' },
          humidity: { type: 'number' },
          conditions: { type: 'string' }
        },
        sla: { availability: 99.9, maxLatency: 500 },
        pricing: { model: 'free', freeQuota: 1000 }
      },
      'aisi://chinanews/rss-feed': {
        id: 'exchange_001',
        serviceId: 'aisi://chinanews/rss-feed',
        endpoint: 'https://www.chinanews.com/rss/',
        providerName: '中国新闻网',
        description: '获取新闻RSS订阅',
        category: 'news'
      }
    };
    
    const service = serviceMap[serviceId];
    
    if (!service) {
      return res.status(404).json({ 
        error: 'Service not found',
        message: `Service with ID ${serviceId} is not registered` 
      });
    }
    
    // 记录解析次数（实际应该更新数据库）
    res.status(200).json({
      success: true,
      service,
      resolvedAt: new Date().toISOString(),
      cache: {
        ttl: 300, // 5分钟缓存
        suggestedRefresh: new Date(Date.now() + 300000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to resolve service',
      message: error.message 
    });
  }
};
