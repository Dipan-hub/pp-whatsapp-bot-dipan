const index = require('./index');

const testEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '918917602924',
                  text: { body: 'wdkjxs' },
                },
              ],
            },
          },
        ],
      },
    ],
  }),
};

index.handler(testEvent)
  .then((response) => console.log(response))
  .catch((error) => console.error(error));