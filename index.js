require("dotenv").config();
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

// Configure AWS SQS
const sqs = new SQSClient({ region: "ap-south-1" });
const processedMessages = new Set();
const QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/245516292058/WhatsAppQueue.fifo";

// Main handler function
const handler = async (event) => {
  console.time("Execution Time");
  console.log("Event Received:", JSON.stringify(event));

  const httpMethod = event.requestContext?.http?.method || event.httpMethod; // Support both Lambda & local testing

  try {
    if (httpMethod === "GET") {
      const queryParams = event.queryStringParameters || {};
      if (queryParams["hub.mode"] === "subscribe" && queryParams["hub.verify_token"] === process.env.VERIFY_TOKEN) {
        console.log("WEBHOOK VERIFIED!");
        return { statusCode: 200, body: queryParams["hub.challenge"], headers: { "Content-Type": "text/plain" } };
      } else {
        console.log("WEBHOOK VERIFICATION FAILED!");
        return { statusCode: 403, body: "Verification failed" };
      }
    }

    if (httpMethod === "POST") {
      const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      console.log("Parsed Body:", body);

      const entry = body.entry?.[0];
      if (!entry) throw new Error("No entry found");

      const changes = entry.changes?.[0];
      if (!changes) throw new Error("No changes found");

      const value = changes.value;
      if (value.messages) {
        const message = value.messages[0];
        const messageId = message.id;

        if (processedMessages.has(messageId)) {
          console.log("Duplicate message detected, ignoring.");
          return { statusCode: 200, body: JSON.stringify({ message: "Duplicate ignored" }) };
        }
        processedMessages.add(messageId);

        const sqsParams = {
          MessageBody: JSON.stringify({
            messageId: message.id,
            sender: message.from,
            messageText: message.text?.body || "",
            timestamp: message.timestamp,
            requestId: event.requestContext?.requestId || "unknown"
          }),
          QueueUrl: QUEUE_URL,
          MessageGroupId: "whatsapp-messages",
          MessageDeduplicationId: message.id,
        };

        await sqs.send(new SendMessageCommand(sqsParams));
        console.log("Message sent to SQS:", messageId);

        return { statusCode: 200, body: JSON.stringify({ message: "Message sent to queue" }) };
      }

      throw new Error("Unsupported event type");
    }

    return { statusCode: 200, body: JSON.stringify("Message processed") };
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  } finally {
    console.timeEnd("Execution Time");
  }
};

// Auto-run locally, but still works in AWS Lambda
if (require.main === module) {
  (async () => {
    const testEvent = {
      requestContext: { http: { method: "POST" } },
      body: JSON.stringify({
        entry: [{ changes: [{ value: { messages: [{ id: "test-message-id-123", from: "918917602924", text: { body: "Hello, bot!" } }] } }] }],
      }),
    };

    console.log("Testing webhook locally...");
    const response = await handler(testEvent);
    console.log("Local Test Response:", response);
  })();
}

module.exports = { handler }; // Export for AWS Lambda
