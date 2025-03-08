require('dotenv').config();
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({ region: 'ap-south-1' });

async function testSQS() {
  const QUEUE_URL = 'https://sqs.ap-south-1.amazonaws.com/245516292058/WhatsAppQueue.fifo';

  const message = {
    id: '12345',
    from: '918917602924',
    text: { body: 'Test message' },
  };

  const sqsParams = new SendMessageCommand({
    MessageBody: JSON.stringify(message),
    QueueUrl: QUEUE_URL,
    MessageGroupId: 'whatsapp-messages',
    MessageDeduplicationId: message.id,
  });

  try {
    const response = await sqs.send(sqsParams);
    console.log('Message sent successfully:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Run the test function
testSQS();
