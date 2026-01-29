// api/directory.js
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    message: 'AISI Registry API Working',
    timestamp: new Date().toISOString()
  });
};
