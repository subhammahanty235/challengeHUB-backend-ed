const amqp = require('amqplib');

async function publishEmailRequest(queue, emailData) {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Ensure queue exists
    await channel.assertQueue(queue, { 
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'email_failures_exchange',
          'x-dead-letter-routing-key': ''
        }
      });
    
    // Add retry count header
    const headers = {
      retryCount: 0
    };
    
    // Publish message
    const message = Buffer.from(JSON.stringify(emailData));
    channel.sendToQueue(queue, message, { 
      persistent: true,
      headers
    });
    
    console.log(`Email request sent to queue ${queue} with template ${emailData.templateId}`);
    
    // Close connection
    setTimeout(() => {
      connection.close();
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Failed to publish email request:', error);
    return false;
  }
}

module.exports = publishEmailRequest