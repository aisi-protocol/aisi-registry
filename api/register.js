// api/register.js - 注册新服务
export default function handler(req, res) {
  // CORS设置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  try {
    // 解析请求体
    const { 
      serviceId, 
      endpoint, 
      providerName, 
      contactEmail, 
      description,
      category = 'other',
      tags = [],
      inputSchema = {},
      outputSchema = {},
      sla = {},
      pricing = {}
    } = req.body;
    
    // 验证必需字段
    const requiredFields = ['serviceId', 'endpoint', 'providerName', 'contactEmail'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        received: req.body
      });
    }
    
    // 验证serviceId格式
    const serviceIdRegex = /^aisi:\/\/[a-z0-9-]+\/[a-z0-9-]+$/;
    if (!serviceIdRegex.test(serviceId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid serviceId format',
        message: 'Service ID must match pattern: aisi://provider-name/service-name',
        received: serviceId,
        example: 'aisi://heweather/current-weather',
        pattern: '^aisi://[a-z0-9-]+/[a-z0-9-]+$'
      });
    }
    
    // 验证URL格式
    try {
      new URL(endpoint);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint URL',
        message: 'Endpoint must be a valid URL',
        received: endpoint,
        details: urlError.message
      });
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
        received: contactEmail
      });
    }
    
    // 创建服务对象
    const newService = {
      id: `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      endpoint,
      providerName,
      providerLevel: 'basic',
      contactEmail,
      description: description || `A service provided by ${providerName}`,
      category: category.toLowerCase(),
      tags: Array.isArray(tags) ? tags : [tags],
      inputSchema,
      outputSchema,
      sla: {
        availability: sla.availability || 99.0,
        maxLatency: sla.maxLatency || 1000,
        ...sla
      },
      pricing: {
        model: pricing.model || 'free',
        freeQuota: pricing.freeQuota || 100,
        ...pricing
      },
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 这里实际应该保存到数据库
    // 暂时模拟保存成功
    console.log('📝 New service registration received:', {
      id: newService.id,
      serviceId: newService.serviceId,
      provider: newService.providerName,
      email: newService.contactEmail,
      timestamp: newService.createdAt
    });
    
    // 成功响应
    res.status(201).json({
      success: true,
      message: 'Service registration submitted successfully',
      data: {
        service: newService,
        registrationId: newService.id
      },
      nextSteps: [
        {
          step: 1,
          action: 'Email verification',
          description: 'Verification email sent to provider',
          timeline: 'Within 5 minutes'
        },
        {
          step: 2,
          action: 'Manual review',
          description: 'Service will be reviewed by AISI team',
          timeline: 'Within 48 hours'
        },
        {
          step: 3,
          action: 'Publication',
          description: 'Upon approval, service will be added to public directory',
          timeline: 'After review completion'
        }
      ],
      support: {
        email: 'support@aisi.run',
        documentation: 'https://docs.aisi.run/registration',
        statusCheck: `https://registry.aisi.run/api/status/${newService.id}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
