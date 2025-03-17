
module.exports = {
    rabbitmq: {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      // Queue configurations with specific settings for each
      queues: {
        authentication : {
          name: process.env.AUTHENTICATION_QUEUE || 'authentication',
          prefetchCount: parseInt(process.env.AUTHENTICATION_PREFETCH || '20'),
          maxRetries: parseInt(process.env.TRANSACTIONAL_MAX_RETRIES || '5'),
          processingPriority: process.env.AUTHENTICATION_PRIORITY || 'high'
        },
        marketing: {
          name: process.env.MARKETING_QUEUE || 'marketing',
          prefetchCount: parseInt(process.env.MARKETING_PREFETCH || '10'),
          maxRetries: parseInt(process.env.MARKETING_MAX_RETRIES || '3'),
          processingPriority: process.env.MARKETING_PRIORITY || 'low',
          rateLimit: parseInt(process.env.MARKETING_RATE_LIMIT || '100') // emails per minute
        },
        challengeRelated: {
          name: process.env.CHRELATED_QUEUE || 'challengeRelated',
          prefetchCount: parseInt(process.env.CHRELATED_PREFETCH || '15'),
          maxRetries: parseInt(process.env.CHRELATED_MAX_RETRIES || '3'),
          processingPriority: process.env.CHRELATED_PRIORITY
        }
      },
      deadLetterQueue: process.env.DEAD_LETTER_QUEUE || 'email_failures'
    },
    email: {
    //   host: process.env.EMAIL_HOST || 'smtp.example.com',
    //   port: parseInt(process.env.EMAIL_PORT || '587'),
    //   secure: process.env.EMAIL_SECURE === 'true',
    //   auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    //   },
      from: process.env.EMAIL_USER,
      // Pool configuration for better performance
      pool: process.env.EMAIL_USE_POOL === 'true',
      maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5'),
      rateLimitPerSecond: parseInt(process.env.EMAIL_RATE_LIMIT || '10')
    },
    templateDirectory: process.env.TEMPLATE_DIRECTORY || './templates',
    strictValidation: process.env.STRICT_VALIDATION === 'true',
    // Global data available to all templates
    globalTemplateData: {
      companyName: process.env.COMPANY_NAME || 'Your Company',
      companyLogo: process.env.COMPANY_LOGO || 'https://example.com/logo.png',
      supportEmail: process.env.SUPPORT_EMAIL,
    //   unsubscribeUrl: process.env.UNSUBSCRIBE_URL || 'https://example.com/unsubscribe',
      websiteUrl: process.env.WEBSITE_URL,
    //   socialLinks: {
    //     facebook: process.env.FACEBOOK_URL,
    //     twitter: process.env.TWITTER_URL,
    //     instagram: process.env.INSTAGRAM_URL,
    //     linkedin: process.env.LINKEDIN_URL
    //   }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      emailErrors: process.env.LOG_EMAIL_ERRORS === 'true',
      errorEmail: process.env.ERROR_EMAIL || 'errors@example.com'
    }
  };