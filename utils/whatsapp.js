module.exports = {
  sendMessage: async (to, message) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            text: { body: message },
          }),
        }
      );

      const data = await response.json();
      console.log('WhatsApp API Response:', data);
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.message);
      throw error; // Re-throw the error to handle it in the handler
    }
  },
};