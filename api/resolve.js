// api/resolve.js - 解析服务标识符
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
    const { serviceId } = req.query;
    
    // 验证必需参数
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameter',
        message: 'serviceId query parameter is required',
        example: '/api/resolve?serviceId=aisi://heweather/current-weather'
      });
    }
    
    // 验证serviceId格式
    if (!serviceId.startsWith('aisi://')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid format',
        message: 'Service ID must start with aisi://',
        received: serviceId,
        expectedFormat: 'aisi://provider-name/service-name'
      });
    }
    
    // 服务映射表
    const serviceMap = {
      'aisi://heweather/current-weather': {
        id: 'heweather_001',
        serviceId: 'aisi://heweather/current-weather',
        endpoint: 'https://devapi.qweather.com/v7/weather/now',
        providerName: '和风天气',
        providerLevel: 'verified',
        contactEmail: 'support@qweather.com',
        description: '获取实时天气数据',
        category: 'weather',
        tags: ['weather', 'api', 'realtime'],
        inputSchema: {
          type: 'object',
          required: ['location'],
          properties: {
            location: { 
              type: 'string', 
              description: '城市名或经纬度，如: "北京" 或 "39.9042,116.4074"' 
            },
            unit: { 
              type: 'string', 
              enum: ['c', 'f'], 
              default: 'c',
              description: '温度单位：c为摄氏度，f为华氏度' 
            },
            lang: {
              type: 'string',
              enum: ['zh', 'en', 'ja'],
              default: 'zh',
              description: '返回语言'
            }
          }
        },
        outputSchema: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'API状态码' },
            updateTime: { type: 'string', format: 'date-time', description: '数据更新时间' },
            temp: { type: 'number', description: '温度' },
            feelsLike: { type: 'number', description: '体感温度' },
            humidity: { type: 'number', description: '湿度百分比' },
            windSpeed: { type: 'number', description: '风速' },
            windDir: { type: 'string', description: '风向' },
            conditions: { type: 'string', description: '天气状况描述' },
            visibility: { type: 'number', description: '能见度' }
          }
        },
        sla: {
          availability: 99.9,
          maxLatency: 500,
          rateLimit: {
            perMinute: 60,
            perDay: 10000
          }
        },
        pricing: {
          model: 'free',
          freeQuota: 1000,
          overQuotaRate: 0.001
        },
        documentation: 'https://dev.qweather.com/docs/api/weather/weather-now/',
        termsOfService: 'https://dev.qweather.com/docs/terms/',
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      'aisi://chinanews/rss-feed': {
        id: 'news_001',
        serviceId: 'aisi://chinanews/rss-feed',
        endpoint: 'https://www.chinanews.com/rss/',
        providerName: '中国新闻网',
        providerLevel: 'verified',
        description: '获取新闻RSS订阅',
        category: 'news',
        tags: ['news', 'rss', 'china'],
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['general', 'politics', 'economy', 'society', 'culture'],
              default: 'general',
              description: '新闻分类'
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 20,
              description: '返回条目数量'
            }
          }
        },
        verificationStatus: 'verified',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    };
    
    const service = serviceMap[serviceId];
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: `Service with ID "${serviceId}" is not registered`,
        suggestion: 'Check the service directory at /api/directory',
        timestamp: new Date().toISOString()
      });
    }
    
    // 成功响应
    res.status(200).json({
      success: true,
      data: {
        service,
        resolvedAt: new Date().toISOString(),
        cache: {
          ttl: 300,
          suggestedRefresh: new Date(Date.now() + 300000).toISOString()
        }
      },
      meta: {
        provider: 'AISI Registry',
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Resolve error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve service',
      message: error.message
    });
  }
}
