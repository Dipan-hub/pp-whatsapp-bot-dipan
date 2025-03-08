const { sendMessage } = require('../utils/whatsapp');
const { addRow } = require('../utils/googleSheets');

// Function to handle "F_ID" messages
const handleFId = async (message) => {
  const userNumber = message.from;
  const messageText = message.text.body;

  try {
    // Log incoming message
    await addRow(userNumber, messageText, 0);

    // Send response
    const responseMessage = 'F_ID received! Sunna Bhai !! HOgyaaa apna kaam krna yaar !!';
    await sendMessage(userNumber, responseMessage);

    // Log outgoing message
    await addRow(userNumber, responseMessage, 1);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'F_ID response sent' }),
    };
  } catch (error) {
    console.error('Error in fIdHandler:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

module.exports = { handleFId };