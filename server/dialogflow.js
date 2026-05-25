const dialogflow = require("@google-cloud/dialogflow");
const path = require("path");

// Point to your downloaded service account key
const keyFilename = path.join(__dirname, "dialogflow-key.json");
const projectId = process.env.DIALOGFLOW_PROJECT_ID || "technest-ntaq";

// Create a Dialogflow session client
const sessionClient = new dialogflow.SessionsClient({ keyFilename });

/**
 * Sends a user message to Dialogflow ES and returns
 * the detected intent, parameters, and fulfillment text.
 *
 * @param {string} message  - The user's raw text message
 * @param {string} sessionId - Unique ID per conversation (uuid)
 * @returns {object} { intentName, parameters, fulfillmentText, confidence }
 */
async function detectIntent(message, sessionId) {
    // Session path ties a conversation to your Dialogflow project
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId,
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: "en-US",
            },
        },
    };

    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    return {
        intentName: result.intent?.displayName || "Default Fallback Intent",
        parameters: result.parameters?.fields
            ? flattenParameters(result.parameters.fields)
            : {},
        fulfillmentText: result.fulfillmentText || "",
        confidence: result.intentDetectionConfidence || 0,
    };
}

/**
 * Dialogflow returns parameters as Protobuf Struct fields.
 * This flattens them into a plain JS object.
 * e.g. { order_id: { numberValue: 123456 } } → { order_id: 123456 }
 */
function flattenParameters(fields) {
    const result = {};
    for (const [key, value] of Object.entries(fields)) {
        if (value.stringValue !== undefined && value.stringValue !== "") {
            result[key] = value.stringValue;
        } else if (value.numberValue !== undefined && value.numberValue !== 0) {
            result[key] = value.numberValue;
        } else if (value.boolValue !== undefined) {
            result[key] = value.boolValue;
        } else if (value.listValue) {
            result[key] = value.listValue.values.map(
                (v) => v.stringValue || v.numberValue,
            );
        }
    }
    return result;
}

module.exports = { detectIntent };
