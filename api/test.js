// api/test.js - 使用兼容的CommonJS语法
module.exports = (req, res) => {
  console.log('Test API called:', req.url);
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'AISI Registry API is working!',
    timestamp: new Date().toISOString(),
    endpoint: req.url,
    method: req.method
  });
};
