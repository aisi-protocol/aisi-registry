import { getDB } from '../db.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5分钟缓存

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: '方法不允许',
      allowed: ['GET']
    });
  }

  try {
    const { serviceId } = req.query;
    
    if (!serviceId) {
      return res.status(400).json({ 
        error: '缺少服务ID参数',
        usage: '/api/resolve?serviceId=aisi://provider/service-name',
        example: '/api/resolve?serviceId=aisi://heweather/current-weather'
      });
    }

    const decodedServiceId = decodeURIComponent(serviceId);
    const db = await getDB();
    
    // 查询服务信息
    const service = await db.get(
      `SELECT id, provider, service_name, service_name_zh, endpoint, method, 
              description_zh, description_en, category, status, created_at
       FROM services 
       WHERE id = ? AND status = 'active'`,
      [decodedServiceId]
    );
    
    if (!service) {
      // 提供有用的错误信息
      const similarServices = await db.all(
        `SELECT id, provider, service_name, description_zh
         FROM services 
         WHERE (provider LIKE ? OR service_name LIKE ?) 
           AND status = 'active'
         LIMIT 5`,
        [`%${decodedServiceId.split('/')[1]}%`, `%${decodedServiceId.split('/')[2]}%`]
      );

      return res.status(404).json({ 
        error: '服务未找到或未激活',
        requested: decodedServiceId,
        suggestions: similarServices.length > 0 ? similarServices : [
          '检查服务ID格式：aisi://provider/service-name',
          '访问 /api/directory 查看所有可用服务',
          '服务可能正在审核中'
        ],
        directory: 'https://registry.aisi.run/api/directory'
      });
    }

    // 构建响应
    const response = {
      success: true,
      service: {
        id: service.id,
        provider: service.provider,
        name: service.service_name,
        name_zh: service.service_name_zh || service.service_name,
        endpoint: service.endpoint,
        method: service.method || 'GET',
        description: service.description_zh || service.description_en || '',
        category: service.category,
        status: service.status,
        created: service.created_at
      },
      resolved: {
        url: service.endpoint,
        method: service.method || 'GET',
        authentication: '查看具体服务了解认证要求'
      },
      metadata: {
        registry: 'AISI Registry v1.0',
        version: '1.0.0',
        resolved_at: new Date().toISOString(),
        cache: '300 seconds',
        request_id: req.headers['x-vercel-id']
      },
      links: {
        self: `https://registry.aisi.run/api/resolve?serviceId=${encodeURIComponent(service.id)}`,
        directory: 'https://registry.aisi.run/api/directory',
        registry: 'https://registry.aisi.run'
      }
    };

    res.json(response);

  } catch (error) {
    console.error('解析服务错误:', {
      serviceId: req.query.serviceId,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false,
      error: '解析服务失败',
      message: '服务器暂时无法处理请求',
      requestId: req.headers['x-vercel-id'],
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
