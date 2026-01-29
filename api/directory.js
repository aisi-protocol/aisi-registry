// api/directory.js
import { Pool } from 'pg';

// 从环境变量获取数据库连接配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // 设置CORS头，允许前端访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category, provider_id, search } = req.query;
    
    // 构建基础查询
    let query = 'SELECT * FROM services WHERE is_active = true';
    const params = [];
    let paramCount = 0;

    // 添加过滤条件
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (provider_id) {
      paramCount++;
      query += ` AND provider_id = $${paramCount}`;
      params.push(provider_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        service_name ILIKE $${paramCount} OR 
        description ILIKE $${paramCount} OR
        $${paramCount} = ANY(tags)
      )`;
      params.push(`%${search}%`);
    }

    // 按创建时间倒序排列
    query += ' ORDER BY created_at DESC';

    console.log('Executing query:', query, 'Params:', params);
    
    // 执行查询
    const result = await pool.query(query, params);
    
    // 返回JSON数据
    res.status(200).json({
      success: true,
      count: result.rowCount,
      services: result.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
