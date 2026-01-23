// api/test.js - 测试端点
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API is working!', 
    method: req.method,
    path: req.url 
  });
}
