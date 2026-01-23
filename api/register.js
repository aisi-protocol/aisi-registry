import { getDB } from './db.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: '方法不允许',
      allowed: ['POST']
    });
  }

  try {
    // 解析请求体
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { provider, service_name, endpoint, description_zh, category } = body;

    // 验证必要字段
    if (!provider || !service_name || !endpoint) {
      return res.status(400).json({ 
        success: false,
        error: '缺少必要字段',
        required: ['provider', 'service_name', 'endpoint'],
        received: { provider, service_name, endpoint }
      });
    }

    // 验证字段格式
    const providerRegex = /^[a-z0-9-]+$/;
    const serviceRegex = /^[a-z0-9-]+$/;
    
    if (!providerRegex.test(provider)) {
      return res.status(400).json({ 
        success: false,
        error: '服务商名称格式错误',
        hint: '只能包含小写字母、数字和横线（-）',
        example: 'your-company'
      });
    }

    if (!serviceRegex.test(service_name)) {
      return res.status(400).json({ 
        success: false,
        error: '服务名称格式错误',
        hint: '只能包含小写字母、数字和横线（-）',
        example: 'weather-service'
      });
    }

    // 验证URL格式
    try {
      new URL(endpoint);
    } catch (e) {
      return res.status(400).json({ 
        success: false,
        error: 'API端点格式错误',
        hint: '必须是有效的URL',
        example: 'https://api.example.com/v1/service'
      });
    }

    const db = await getDB();
    const serviceId = `aisi://${provider}/${service_name}`;

    // 检查服务是否已存在
    const existing = await db.get(
      'SELECT id FROM services WHERE id = ?',
      [serviceId]
    );
    
    if (existing) {
      return res.status(409).json({ 
        success: false,
        error: '服务已存在',
        serviceId,
        suggestions: [
          `使用不同的服务名称：${service_name}-v2`,
          `使用不同的服务商前缀`,
          `联系管理员处理重复问题`
        ]
      });
    }

    // 插入新服务
    await db.run(
      `INSERT INTO services (id, provider, service_name, endpoint, description_zh, category) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [serviceId, provider, service_name, endpoint, description_zh || '', category || 'other']
    );

    console.log(`新服务注册成功: ${serviceId}`);

    res.status(201).json({
      success: true,
      serviceId,
      message: '服务注册成功！',
      urls: {
        view: `https://registry.aisi.run/#/service/${encodeURIComponent(serviceId)}`,
        resolve: `https://registry.aisi.run/api/resolve/${encodeURIComponent(serviceId)}`,
        api: `https://registry.aisi.run/api/resolve/${encodeURIComponent(serviceId)}`
      },
      nextSteps: [
        '服务已添加到注册中心',
        '可通过解析API获取服务端点',
        '建议测试服务可用性'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('注册服务错误:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false,
      error: '服务器内部错误',
      message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试',
      requestId: req.headers['x-vercel-id'],
      timestamp: new Date().toISOString()
    });
  }
}
