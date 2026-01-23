// api/directory.js - 获取服务目录
module.exports = async (req, res) => {
  try {
    // 示例数据 - 实际应该从数据库查询
    const services = [
      {
        id: 'heweather_001',
        serviceId: 'aisi://heweather/current-weather',
        endpoint: 'https://devapi.qweather.com/v7/weather/now',
        providerName: '和风天气',
        description: '获取实时天气数据',
        category: 'weather',
        verificationStatus: 'verified'
      },
      {
        id: 'exchange_001', 
        serviceId: 'aisi://chinanews/rss-feed',
        endpoint: 'https://www.chinanews.com/rss/',
        providerName: '中国新闻网',
        description: '获取新闻RSS订阅',
        category: 'news',
        verificationStatus: 'verified'
      },
      {
        id: 'finance_001',
        serviceId: 'aisi://exchangerate/api',
        endpoint: 'https://api.exchangerate-api.com/v4/latest/USD',
        providerName: '汇率API',
        description: '获取实时汇率信息',
        category: 'finance',
        verificationStatus: 'pending'
      },
      {
        id: 'tools_001',
        serviceId: 'aisi://ipinfo/geo',
        endpoint: 'https://ipinfo.io/json',
        providerName: 'IP信息查询',
        description: '获取IP地理位置信息',
        category: 'tools',
        verificationStatus: 'verified'
      },
      {
        id: 'ai_001',
        serviceId: 'aisi://deepseek/chat',
        endpoint: 'https://api.deepseek.com/chat',
        providerName: 'DeepSeek AI',
        description: 'AI对话服务',
        category: 'ai',
        verificationStatus: 'official'
      }
    ];

    // 支持分页和过滤
    const { page = 1, limit = 20, category } = req.query;
    let filteredServices = [...services];
    
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);
    
    res.status(200).json({
      total: filteredServices.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredServices.length / limit),
      services: paginatedServices,
      categories: [...new Set(services.map(s => s.category))]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch service directory',
      message: error.message 
    });
  }
};
