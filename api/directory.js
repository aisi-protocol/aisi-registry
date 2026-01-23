// api/directory.js - 获取服务目录
export default function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 示例服务数据
    const services = [
      {
        id: 'heweather_001',
        serviceId: 'aisi://heweather/current-weather',
        endpoint: 'https://devapi.qweather.com/v7/weather/now',
        providerName: '和风天气',
        description: '获取实时天气数据',
        category: 'weather',
        tags: ['weather', 'api', 'realtime'],
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'news_001',
        serviceId: 'aisi://chinanews/rss-feed',
        endpoint: 'https://www.chinanews.com/rss/',
        providerName: '中国新闻网',
        description: '获取新闻RSS订阅',
        category: 'news',
        tags: ['news', 'rss', 'china'],
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'finance_001',
        serviceId: 'aisi://exchangerate/api',
        endpoint: 'https://api.exchangerate-api.com/v4/latest/USD',
        providerName: '汇率API',
        description: '获取实时汇率信息',
        category: 'finance',
        tags: ['finance', 'currency', 'exchange'],
        verificationStatus: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'tools_001',
        serviceId: 'aisi://ipinfo/geo',
        endpoint: 'https://ipinfo.io/json',
        providerName: 'IP信息查询',
        description: '获取IP地理位置信息',
        category: 'tools',
        tags: ['tools', 'ip', 'geolocation'],
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'ai_001',
        serviceId: 'aisi://deepseek/chat',
        endpoint: 'https://api.deepseek.com/chat',
        providerName: 'DeepSeek AI',
        description: 'AI对话服务',
        category: 'ai',
        tags: ['ai', 'chat', 'assistant'],
        verificationStatus: 'official',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    // 获取查询参数
    const { 
      page = 1, 
      limit = 20, 
      category,
      search 
    } = req.query;
    
    let filteredServices = [...services];
    
    // 按分类筛选
    if (category) {
      filteredServices = filteredServices.filter(s => s.category === category);
    }
    
    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredServices = filteredServices.filter(s => 
        s.serviceId.toLowerCase().includes(searchLower) ||
        s.providerName.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // 分页处理
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);
    
    // 获取所有分类
    const categories = [...new Set(services.map(s => s.category))];
    
    res.status(200).json({
      success: true,
      data: {
        total: filteredServices.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredServices.length / limitNum),
        services: paginatedServices,
        categories,
        filters: {
          applied: { category, search },
          available: { categories }
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Directory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service directory',
      message: error.message
    });
  }
}
