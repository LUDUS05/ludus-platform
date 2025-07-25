const {onCall} = require("firebase-functions/v2/https");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const SECRET_NAME = "LDSCLAUDE";

exports.askClaude = onCall({secrets: [SECRET_NAME]}, async (request) => {
    const userMessage = request.data.message;

    if (!userMessage) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "The function must be called with a 'message' argument.",
        );
    }

    const claudeApiKey = process.env[SECRET_NAME];

    const claudeApiUrl = "https://api.anthropic.com/v1/messages";
    const requestBody = {
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{role: "user", content: userMessage}],
    };
    const requestHeaders = {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    };

    try {
        const apiResponse = await axios.post(claudeApiUrl, requestBody, {
            headers: requestHeaders,
        });
        return {response: apiResponse.data.content[0].text};
    } catch (error) {
        console.error("Error calling Claude API:", error.message);
        throw new functions.https.HttpsError(
            "internal",
            "Failed to call Claude API.",
        );
    }
});
