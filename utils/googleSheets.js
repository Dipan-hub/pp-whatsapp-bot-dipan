const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

// Configure Google Sheets API
const auth = new GoogleAuth({
  keyFile: './pp-support-aws-dipan-gcp-9c878d6bd6db.json', // Relative path
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

// Function to add a row to Google Sheets
const addRow = async (phone, message, isOutbound) => {
  const timestamp = new Date().toISOString();
  const values = [[phone, message, timestamp, isOutbound]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:F', // Hardcoded range
      valueInputOption: 'RAW',
      resource: { values },
    });

    console.log('Message logged to Google Sheets');
  } catch (error) {
    console.error('Error logging to Google Sheets:', error.message);
    throw error; // Re-throw the error to handle it in the handler
  }
};

module.exports = { addRow };