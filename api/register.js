// api/register.js - 注册新服务
module.exports = async (req, res) => {
  try {
    const { 
      serviceId, 
      endpoint, 
      providerName, 
      contactEmail, 
      description,
      category,
      tags,
      inputSchema,
      outputSchema
    } = req.body;
    
    // 验证必填字段
    if (!serviceId || !endpoint || !providerName || !contactEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['serviceId', 'endpoint', 'providerName', 'contactEmail'],
        received: req.body 
      });
    }
    
    // 验证serviceId格式
    const serviceIdRegex = /^aisi:\/\/[a-z0-9-]+\/[a-z0-9-]+$/;
    if (!serviceIdRegex.test(serviceId)) {
      return res.status(400).json({ 
        error: 'Invalid serviceId format',
        message: 'Service ID must match pattern: aisi://provider-name/service-name',
        example: 'aisi://heweather/current-weather' 
      });
    }
    
    // 验证URL格式
    try {
      new URL(endpoint);
    } catch {
      return res.status(400).json({ 
        error: 'Invalid endpoint URL',
        message: 'Endpoint must be a valid URL' 
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Please provide a valid email address' 
      });
    }
    
    // 这里应该是保存到数据库的逻辑
    // 暂时返回成功响应
    const newService = {
      id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      endpoint,
      providerName,
      providerLevel: 'basic', // 默认基础级别
      contactEmail,
      description: description || `A service provided by ${providerName}`,
      category: category || 'other',
      tags: tags || [],
      inputSchema: inputSchema || {},
      outputSchema: outputSchema || {},
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 实际应该保存到数据库
    console.log('New service registration:', newService);
    
    res.status(201).json({
      success: true,
      message: 'Service registration submitted successfully',
      service: newService,
      nextSteps: [
        'Verification email sent to provider',
        'Service will be reviewed within 48 hours',
        'Upon approval, service will be added to public directory'
      ]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
