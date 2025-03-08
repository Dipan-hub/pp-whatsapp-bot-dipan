const { sendMessage } = require('../utils/whatsapp');
const { addRow } = require('../utils/googleSheets');

// Function to handle default messages
const handleDefault = async (message) => {
  const userNumber = message.from;
  const messageText = message.text.body;

  try {
    // Log incoming message
    await addRow(userNumber, messageText, 0);

    // Send default response
    const responseMessage = 'Thank you for your message!';
    await sendMessage(userNumber, responseMessage);

    // Log outgoing message
    await addRow(userNumber, responseMessage, 1);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Default response sent' }),
    };
  } catch (error) {
    console.error('Error in handleDefault:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

module.exports = { handleDefault };
