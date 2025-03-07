const { sendMessage } = require('../utils/whatsapp');
const { addRow } = require('../utils/googleSheets');

const handleHello = async (message) => {
  const userNumber = message.from;
  const messageText = message.text.body;

  console.log(`handleHello triggered for ${userNumber} with message: "${messageText}"`);

  try {
    await addRow(userNumber, messageText, 0);
    const responseMessage = 'How may I help you? Please put your message here till the Support team gets connected!';
    await sendMessage(userNumber, responseMessage);
    await addRow(userNumber, responseMessage, 1);

    console.log(`handleHello response sent to ${userNumber}`);
    return { statusCode: 200, body: JSON.stringify({ message: 'Hello response sent' }) };
  } catch (error) {
    console.error('Error in handleHello:', error.stack);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};

module.exports = { handleHello };
