const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const config = require('./config');

async function startMarketingMailConsumer() {
    try {
        // Get queue config
        const queueConfig = config.rabbitmq.queues.marketing;
        const queueName = queueConfig.name;
        const deadLetterQueue = config.rabbitmq.deadLetterQueue;

        // Connect to RabbitMQ
        connection = await amqp.connect(config.rabbitmq.url);
        channel = await connection.createChannel();

        // Setup dead letter exchange
        await channel.assertExchange(deadLetterQueue + '_exchange', 'direct', {
            durable: true
        });

        await channel.assertQueue(deadLetterQueue, {
            durable: true,
        });

        await channel.bindQueue(deadLetterQueue, deadLetterQueue + '_exchange', '');
        // await channel.deleteQueue(queueName);
        // Setup main queue with dead letter exchange
        await channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': deadLetterQueue + '_exchange',
                'x-dead-letter-routing-key': ''
            }
        });

        // Set prefetch count
        channel.prefetch(queueConfig.prefetchCount);

        console.log(`[Transactional] Connected to RabbitMQ, consuming from ${queueName}`);

        // Consume messages
        channel.consume(queueName, async (message) => {
            if (message) {
                const headers = message.properties.headers || {};
                const retryCount = headers.retryCount || 0;

                try {
                    // const success = await emailService.processEmail(message, {
                    //     priority: queueConfig.processingPriority
                    // });
                    const success = true;
                    console.log("<---------------Message Recieved from the Consumer End------------------->")
                    console.log(message)

                    if (success) {
                        channel.ack(message);
                    } else {
                        // Check if we should retry
                        if (retryCount < queueConfig.maxRetries) {
                            // Update retry count and re-queue
                            const updatedHeaders = { ...headers, retryCount: retryCount + 1 };

                            setTimeout(() => {
                                channel.publish('', queueName, message.content, {
                                    persistent: true,
                                    headers: updatedHeaders
                                });
                                channel.ack(message);
                            }, Math.pow(2, retryCount) * 1000); // Exponential backoff

                            console.log(`[Transactional] Retrying message, attempt ${retryCount + 1} of ${queueConfig.maxRetries}`);
                        } else {
                            // Move to dead letter queue by rejecting without requeue
                            console.log(`[Transactional] Max retries reached, moving to dead letter queue`);
                            channel.nack(message, false, false);
                        }
                    }
                } catch (error) {
                    console.error('[Transactional] Error processing message:', error);

                    // Handle the same retry logic as above
                    if (retryCount < queueConfig.maxRetries) {
                        const updatedHeaders = { ...headers, retryCount: retryCount + 1 };

                        setTimeout(() => {
                            channel.publish('', queueName, message.content, {
                                persistent: true,
                                headers: updatedHeaders
                            });
                            channel.ack(message);
                        }, Math.pow(2, retryCount) * 1000);

                        console.log(`[Transactional] Retrying message after error, attempt ${retryCount + 1} of ${queueConfig.maxRetries}`);
                    } else {
                        console.log(`[Transactional] Max retries reached after error, moving to dead letter queue`);
                        channel.nack(message, false, false);
                    }
                }
            }
        });
    } catch (error) {
        console.error('[Transactional] RabbitMQ connection error:', error);

        // Attempt to reconnect after a delay
        setTimeout(startMarketingMailConsumer, 5000);
    }
}


module.exports = { startMarketingMailConsumer }