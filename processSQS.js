const { handleHello } = require('./handlers/helloHandler');
const { handleFId } = require('./handlers/fIdHandler');
const { handleDefault } = require('./handlers/defaultHandler');
const { addRow } = require('./utils/googleSheets');

const processedMessages = new Set(); // Store processed message IDs to prevent duplicates
const cache = new Map(); // Simple in-memory cache

exports.processMessages = async (records) => {
    console.time('SQS Execution Time');

    for (const record of records) {
        try {
            const body = JSON.parse(record.body);
            console.log('Processing SQS Message:', body);

            const { messageId, sender, messageText, timestamp, requestId } = body;
            
            // Prevent duplicate processing (already handled by FIFO, but extra safety)
            if (processedMessages.has(messageId)) {
                console.log('⚠️ Duplicate message detected in SQS, ignoring.');
                continue;
            }
            processedMessages.add(messageId);

            if (!messageText) {
                console.warn('⚠️ No message text found, skipping.');
                continue;
            }

            console.log(`📌 Processing: ID=${messageId}, Sender=${sender}`);

            const lowerText = messageText.toLowerCase().trim();

            // Cache to avoid repetitive processing of same text
            if (cache.has(lowerText)) {
                console.log('⚡ Cache hit! Returning cached response.');
                continue;
            }

            // Determine handler
            let handler;
            if (lowerText.includes('f_id')) {
                console.log('📌 Routing to handleFId');
                handler = handleFId;
            } else if (['hello', 'hi'].includes(lowerText)) {
                console.log('📌 Routing to handleHello');
                handler = handleHello;
            } else {
                console.log('📌 Routing to handleDefault');
                handler = handleDefault;
            }

            // Execute handler with timeout failsafe
            const result = await Promise.race([
                handler(body),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Function timeout!')), 2500))
            ]);

            cache.set(lowerText, result);
            setTimeout(() => {
                console.log('🗑️ Cache expired for:', lowerText);
                cache.delete(lowerText);
            }, 60000);

            // Convert timestamp
            const readableTimestamp = new Date(timestamp * 1000).toISOString();

            // Log to Google Sheets
            try {
                console.log('📝 Logging to Google Sheets...');
                await addRow(sender, messageText, messageId, readableTimestamp, requestId);
                console.log('✅ Successfully logged to Sheets');
            } catch (error) {
                console.error('❌ Failed to log to Sheets:', error);
            }

        } catch (error) {
            console.error('❌ Error processing SQS message:', error);
        }
    }

    console.timeEnd('SQS Execution Time');
};
