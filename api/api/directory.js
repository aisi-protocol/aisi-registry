import { getDB } from './db.js';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=600'); // 10分钟缓存

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
    const db = await getDB();
    const { 
      category, 
      provider, 
      search,
      limit = 50, 
      offset = 0 
    } = req.query;

    // 构建查询
    let query = `
      SELECT id, provider, service_name, service_name_zh, 
             description_zh, category, status, created_at
      FROM services 
      WHERE status = 'active'
    `;
    
    const params = [];
    const conditions = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (provider) {
      conditions.push('provider = ?');
      params.push(provider);
    }

    if (search) {
      conditions.push('(service_name LIKE ? OR description_zh LIKE ? OR provider LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    // 获取总数
    const countQuery = query.replace(
      'SELECT id, provider, service_name, service_name_zh, description_zh, category, status, created_at',
      'SELECT COUNT(*) as count'
    );
    const totalResult = await db.get(countQuery, params);

    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const limitNum = Math.min(parseInt(limit), 100); // 最多100条
    const offsetNum = parseInt(offset) || 0;
    params.push(limitNum, offsetNum);

    // 执行查询
    const services = await db.all(query, params);

    // 获取分类统计
    const categories = await db.all(`
      SELECT category, COUNT(*) as count 
      FROM services 
      WHERE status = 'active' 
      GROUP BY category 
      ORDER BY count DESC
    `);

    // 获取服务商统计
    const providers = await db.all(`
      SELECT provider, COUNT(*) as count 
      FROM services 
      WHERE status = 'active' 
      GROUP BY provider 
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      metadata: {
        version: '1.0.0',
        count: services.length,
        total: totalResult.count,
        limit: limitNum,
        offset: offsetNum,
        has_more: (offsetNum + services.length) < totalResult.count,
        timestamp: new Date().toISOString()
      },
      filters: {
        available_categories: categories,
        top_providers: providers,
        current: { category, provider, search }
      },
      services: services.map(service => ({
        id: service.id,
        provider: service.provider,
        name: service.service_name,
        name_zh: service.service_name_zh || service.service_name,
        description: service.description_zh || '',
        category: service.category,
        status: service.status,
        created: service.created_at,
        links: {
          resolve: `https://registry.aisi.run/api/resolve?serviceId=${encodeURIComponent(service.id)}`,
          detail: `https://registry.aisi.run/#/service/${encodeURIComponent(service.id)}`
        }
      })),
      links: {
        self: `https://registry.aisi.run/api/directory?${new URLSearchParams(req.query)}`,
        first: `https://registry.aisi.run/api/directory?limit=${limitNum}&offset=0`,
        next: (offsetNum + services.length) < totalResult.count 
          ? `https://registry.aisi.run/api/directory?limit=${limitNum}&offset=${offsetNum + limitNum}`
          : null
      }
    });

  } catch (error) {
    console.error('目录查询错误:', {
      query: req.query,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({ 
      success: false,
      error: '查询目录失败',
      message: '服务器暂时无法处理请求',
      timestamp: new Date().toISOString()
    });
  }
}
