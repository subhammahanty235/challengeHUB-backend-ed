// email-service.js
require('dotenv').config()
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const config = require('./config');

// // Create a nodemailer transporter with pooling
// const transporter = nodemailer.createTransport({
//   host: config.email.host,
//   port: config.email.port,
//   secure: config.email.secure,
//   auth: {
//     user: config.email.auth.user,
//     pass: config.email.auth.pass
//   },
//   pool: config.email.pool,
//   maxConnections: config.email.maxConnections,
//   rateDelta: 1000 / config.email.rateLimitPerSecond
// });
const emailId = process.env.EMAIL_USER
const password = process.env.EMAIL_PASSWORD
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailId,
        pass: password
    }
});

// Template and schema caches
const templateCache = {};
const schemaCache = {};

// Helper function to load a template and its schema
async function loadTemplateAndSchema(templateId) {
  if (templateCache[templateId] && schemaCache[templateId]) {
    return {
      template: templateCache[templateId],
      schema: schemaCache[templateId]
    };
  }
  
  const templatePath = path.join(config.templateDirectory, `${templateId}.html`);
  const schemaPath = path.join(config.templateDirectory, `${templateId}.schema.json`);
  
  try {
    // Load and compile template
    const templateContent = await fs.readFile(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(templateContent);
    templateCache[templateId] = compiledTemplate;
    
    // Load schema if exists
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);
      schemaCache[templateId] = schema;
    } catch (schemaError) {
      console.warn(`No schema found for template ${templateId}, skipping validation`);
      schemaCache[templateId] = null;
    }
    
    return {
      template: templateCache[templateId],
      schema: schemaCache[templateId]
    };
  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error);
    throw new Error(`Template ${templateId} not found`);
  }
}

// Validate data against schema
function validateData(data, schema) {
  if (!schema) return { valid: true };
  
  const missingFields = [];
  const extraFields = [];
  
  // Check for required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined) {
        missingFields.push(field);
      }
    }
  }
  
  // Check for extra fields
  if (schema.properties && schema.additionalProperties === false) {
    const allowedFields = Object.keys(schema.properties);
    for (const field in data) {
      if (!allowedFields.includes(field)) {
        extraFields.push(field);
      }
    }
  }
  
  const valid = missingFields.length === 0 && 
    (schema.additionalProperties !== false || extraFields.length === 0);
    
  return {
    valid,
    missingFields,
    extraFields
  };
}

// Process email message
async function processEmail(message, options = {}) {
  const startTime = Date.now();
  
  try {
    const { templateId, data, recipient, subject } = JSON.parse(message.content.toString());
    const queueName = message.fields.routingKey;
    
    console.log(`[${queueName}] Processing email with template: ${templateId}`);
    
    // Load template and schema
    const { template, schema } = await loadTemplateAndSchema(templateId);
    
    // Validate data if schema exists
    if (schema) {
      const validation = validateData(data, schema);
      if (!validation.valid) {
        console.error(`[${queueName}] Data validation failed for template ${templateId}:`, {
          missingFields: validation.missingFields,
          extraFields: validation.extraFields
        });
        
        // Log the error but proceed with sending (can be configured to fail instead)
        if (config.strictValidation) {
          throw new Error(`Data validation failed for template ${templateId}`);
        }
      }
    }
    
    // Apply default values from schema if available
    const enrichedData = { ...data };
    if (schema && schema.properties) {
      Object.entries(schema.properties).forEach(([field, props]) => {
        if (enrichedData[field] === undefined && props.default !== undefined) {
          enrichedData[field] = props.default;
        }
      });
    }
    
    // Merge with global data available to all templates
    const mergedData = {
      ...config.globalTemplateData,
      ...enrichedData,
      currentYear: new Date().getFullYear()
    };
    
    // Render the template
    const htmlContent = template(mergedData);
    
    // Send the email
    const mailOptions = {
      from: data.from || config.email.from,
      to: recipient,
      subject: subject,
      html: htmlContent
    };
    
    // Add CC and BCC if provided
    if (data.cc) mailOptions.cc = data.cc;
    if (data.bcc) mailOptions.bcc = data.bcc;
    
    // Add attachments if provided
    if (data.attachments) {
      mailOptions.attachments = data.attachments;
    }
    
    // Set priority if provided
    if (options.priority) {
      mailOptions.priority = options.priority;
    }
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    const processingTime = Date.now() - startTime;
    console.log(`[${queueName}] Email sent: ${info.messageId} (${processingTime}ms)`);
    
    return true;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Email processing failed after ${processingTime}ms:`, error);
    
    // Notify about errors if configured
    if (config.logging.emailErrors) {
      try {
        await transporter.sendMail({
          from: config.email.from,
          to: config.logging.errorEmail,
          subject: 'Email Processing Error',
          text: `Error: ${error.message}\nStack: ${error.stack}\nMessage: ${message.content.toString()}`
        });
      } catch (notifyError) {
        console.error('Failed to send error notification:', notifyError);
      }
    }
    
    return false;
  }
}

// Health check function
function healthCheck() {
  return {
    status: 'ok',
    emailService: {
      pool: transporter.isIdle(),
      pendingCount: transporter.pendingCount,
      templatesCached: Object.keys(templateCache).length
    }
  };
}

module.exports = {
  processEmail,
  healthCheck
};