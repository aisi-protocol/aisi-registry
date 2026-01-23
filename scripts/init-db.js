// scripts/init-db.js - 数据库初始化
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'registry.db');
const dbDir = path.dirname(dbPath);

console.log('🔄 Initializing AISI Registry database...');
console.log(`📁 Database path: ${dbPath}`);

// 确保目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Created directory: ${dbDir}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// 创建表结构
const initTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 服务表
      db.run(`CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        service_id TEXT UNIQUE NOT NULL,
        endpoint TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        provider_level TEXT DEFAULT 'basic',
        contact_email TEXT,
        description TEXT,
        category TEXT,
        tags TEXT,
        input_schema TEXT,
        output_schema TEXT,
        sla_availability REAL DEFAULT 99.0,
        pricing_model TEXT DEFAULT 'free',
        verification_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('❌ Failed to create services table:', err.message);
          reject(err);
        } else {
          console.log('✅ Services table ready');
        }
      });

      // 插入示例数据
      db.run(`INSERT OR IGNORE INTO services (id, service_id, endpoint, provider_name, description, category) VALUES 
        ('heweather_001', 'aisi://heweather/current-weather', 'https://devapi.qweather.com/v7/weather/now', '和风天气', '获取实时天气数据', 'weather'),
        ('exchange_001', 'aisi://chinanews/rss-feed', 'https://www.chinanews.com/rss/', '中国新闻网', '获取新闻RSS订阅', 'news'),
        ('finance_001', 'aisi://exchangerate/api', 'https://api.exchangerate-api.com/v4/latest/USD', '汇率API', '获取实时汇率信息', 'finance'),
        ('tools_001', 'aisi://ipinfo/geo', 'https://ipinfo.io/json', 'IP信息查询', '获取IP地理位置信息', 'tools'),
        ('ai_001', 'aisi://deepseek/chat', 'https://api.deepseek.com/chat', 'DeepSeek AI', 'AI对话服务', 'ai')
      `, (err) => {
        if (err) {
          console.error('❌ Failed to insert sample data:', err.message);
        } else {
          console.log('✅ Sample data inserted (5 services)');
        }
      });

      // 创建索引
      db.run('CREATE INDEX IF NOT EXISTS idx_service_id ON services(service_id)', () => {
        console.log('✅ Database indexes ready');
        resolve();
      });
    });
  });
};

// 执行初始化
initTables()
  .then(() => {
    console.log('🎉 Database initialization completed successfully');
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('🔒 Database connection closed');
      }
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('💥 Database initialization failed:', err);
    process.exit(1);
  });
