const amqplib = require('amqplib')
const config = require('./config');
const { processEmail } = require('./emailServer');
async function startAuthMailConsumer() {
    try {
        const queueConfig = config.rabbitmq.queues.authentication;
        const queueName = queueConfig.name;
        const deadLetterQueue = config.rabbitmq.deadLetterQueue;

        const connection = await amqplib.connect(config.rabbitmq.url);
        const channel = await connection.createChannel();

        await channel.assertExchange(deadLetterQueue + '_exchange', 'direct', {
            durable: true
        })

        await channel.assertQueue(deadLetterQueue, {
            durable: true
        })
        await channel.bindQueue(deadLetterQueue, deadLetterQueue + '_exchange', '');

        await channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': deadLetterQueue + '_exchange',
                'x-dead-letter-routing-key': ''
            }
        })

        channel.prefetch(queueConfig.prefetchCount);
        console.log(`[Authentication] Connected to RabbitMQ, consuming from ${queueName}`);

        channel.consume(queueName, async (message) => {
            if (message) {
                const headers = message.properties.headers || {};
                const retryCount = headers.retryCount || 0;

                try {
                    const success = processEmail(message, {
                        priority: queueConfig.processingPriority
                    })
                    console.log("<---------------Message Recieved from the auth Consumer End------------------->")
                    console.log(message)
                    console.log(success)
                    if (success) {
                        channel.ack(message);
                    } else {
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

                            console.log(`[Authentication] Retrying message, attempt ${retryCount + 1} of ${queueConfig.maxRetries}`);

                        } else {
                            console.log(`[Authentication] Max retries reached, moving to dead letter queue`);
                            channel.nack(message, false, false);
                        }
                    }


                } catch (error) {
                    console.error('[Authentication] Error processing message:', error);

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

                        console.log(`[Authentication] Retrying message after error, attempt ${retryCount + 1} of ${queueConfig.maxRetries}`);
                    } else {
                        console.log(`[Authentication] Max retries reached after error, moving to dead letter queue`);
                        channel.nack(message, false, false);
                    }
                }
            }
        })
    } catch (error) {
        console.error('[Authentication] RabbitMQ connection error:', error);

        // Attempt to reconnect after a delay
        setTimeout(startAuthMailConsumer, 5000);
    }
}

module.exports = { startAuthMailConsumer }