const { handler } = require("./index.js"); // Import your Lambda function

const testEvent = {
  requestContext: { http: { method: "POST" } }, // Simulating API Gateway event
  body: JSON.stringify({
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  id: "test-message-id-123",
                  from: "918917602924",
                  text: { body: "Hello, bot!" },
                },
              ],
            },
          },
        ],
      },
    ],
  }),
};

(async () => {
  console.log("Testing webhook processing...");
  const response = await handler(testEvent); // Call the Lambda function
  console.log("Response from handler:", response);
})();
