require('dotenv').config();
const { handleHello } = require('./handlers/helloHandler');
const { handleFId } = require('./handlers/fIdHandler');
const { handleDefault } = require('./handlers/defaultHandler');

const processedMessages = new Set(); // Store processed message IDs to prevent duplicates

exports.handler = async (event) => {
  console.time('Execution Time');
  console.log('Event Received:', JSON.stringify(event));

  const httpMethod = event.requestContext?.http?.method || event.httpMethod;
  let response;

  try {
    if (httpMethod === 'GET') {
      const queryParams = event.queryStringParameters || {};
      if (queryParams['hub.mode'] === 'subscribe' && queryParams['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK VERIFIED!');
        return {
          statusCode: 200,
          body: queryParams['hub.challenge'],
          headers: { 'Content-Type': 'text/plain' },
        };
      } else {
        console.log('WEBHOOK VERIFICATION FAILED!');
        return { statusCode: 403, body: 'Verification failed' };
      }
    }

    if (httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      console.log('Parsed Body:', body);

      const entry = body.entry?.[0];
      if (!entry) throw new Error('No entry found');

      const changes = entry.changes?.[0];
      if (!changes) throw new Error('No changes found');

      const value = changes.value;
      
      if (value.statuses) {
        console.log('Message status update:', value.statuses[0]);
        return { statusCode: 200, body: JSON.stringify({ message: 'Status update processed' }) };
      }

      if (value.messages) {
        const message = value.messages[0];
        const messageId = message.id;

        // Prevent duplicate processing
        if (processedMessages.has(messageId)) {
          console.log('Duplicate message detected, ignoring.');
          return { statusCode: 200, body: JSON.stringify({ message: 'Duplicate ignored' }) };
        }
        processedMessages.add(messageId);

        const messageText = message.text?.body;
        if (!messageText) throw new Error('No message text found');

        const lowerText = messageText.toLowerCase().trim();

        // Determine the handler
        let handler;
        if (lowerText.includes('f_id')) {
          console.log('Routing to handleFId');
          handler = handleFId;
        } else if (['hello', 'hi'].includes(lowerText)) {
          console.log('Routing to handleHello');
          handler = handleHello;
        } else {
          console.log('Routing to handleDefault');
          handler = handleDefault;
        }

        // Execute handler with timeout failsafe
        const result = await Promise.race([
          handler(message),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Function timeout!')), 2500))
        ]);

        return { statusCode: 200, body: JSON.stringify(result) };
      }

      throw new Error('Unsupported event type');
    }

    return { statusCode: 200, body: JSON.stringify('Message processed') };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    console.timeEnd('Execution Time');
  }
};
