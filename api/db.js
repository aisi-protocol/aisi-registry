```javascript
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';

// 数据库路径：Vercel环境使用/tmp，本地使用当前目录
const dbPath = process.env.VERCEL 
  ? join('/tmp', 'aisi-registry.db')
  : './aisi-registry.db';

let dbInstance = null;

/**
 * 获取数据库连接（单例模式）
 */
export async function getDB() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // 初始化数据库表
    await initTables(dbInstance);
  }
  return dbInstance;
}

/**
 * 初始化数据库表
 */
async function initTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      service_name TEXT NOT NULL,
      service_name_zh TEXT,
      endpoint TEXT NOT NULL,
      method TEXT DEFAULT 'GET',
      description_zh TEXT,
      description_en TEXT,
      category TEXT,
      parameters TEXT DEFAULT '[]',
      examples TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建索引
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
  `);

  // 插入示例数据（如果表为空）
  const { count } = await db.get('SELECT COUNT(*) as count FROM services');
  if (count === 0) {
    await db.run(`
      INSERT INTO services (id, provider, service_name, endpoint, description_zh, category, status)
      VALUES 
      ('aisi://aisi/health-check', 'aisi', 'health-check', 'https://registry.aisi.run/api/health', 'AISI健康检查服务', 'utility', 'active'),
      ('aisi://heweather/current-weather', 'heweather', 'current-weather', 'https://devapi.qweather.com/v7/weather/now', '实时天气查询', 'weather', 'active'),
      ('aisi://ipinfo/geo-location', 'ipinfo', 'geo-location', 'https://ipinfo.io/json', 'IP地理位置查询', 'location', 'active'),
      ('aisi://timor/china-holiday', 'timor', 'china-holiday', 'https://timor.tech/api/holiday/info/', '中国节假日查询', 'calendar', 'active'),
      ('aisi://amap/geocoding', 'amap', 'geocoding', 'https://restapi.amap.com/v3/geocode/geo', '高德地图地理编码', 'location', 'active')
    `);
    console.log('已插入5个示例服务');
  }
}

/**
 * 关闭数据库连接
 */
export async function closeDB() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
