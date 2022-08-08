/* eslint-disable no-undef */
require('dotenv').config();
const { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isConversationCreate, isTextMessage, isIgnoredChannel } = require("./webhookRequest");
const Bot = require('./bot');

exports.webhookHandler = (req, res) => {

    console.log(JSON.stringify(req.body));

    const webhookEventApiKey = req.headers["x-api-key"];

    if (!isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }

    const {
        app: { id: appId } ,
        events: [messageEvent],
    } = req.body;
    
    const {
        type: messageEventType,
        payload: {
            conversation: {
                id: conversationId,
                activeSwitchboardIntegration: {
                    id: activeSwitchboardIntegration,
                },
            },
            message: {
                author: { userId, type: authorType, displayName } = {},
                user: {
                    externalId: externalId } = { externalId: `${userId}` },
                profile: { email } = { email: `${userId}@example.com` },
                content: { text: userMessage, type: contentType, payload: contentPayload } = { text: "hi", type: "text", payload: "hi" },
                source: { integrationId: sourceIntegrationId , type: sourceType },
            } = {},
        },
    } = messageEvent || {};

    switchBoardMetadata = {
        givenName: displayName,
        email: email,
        externalId: externalId,
        eventSource: sourceType,
        conversation: conversationId
    };

    const bot = new Bot(appId, conversationId);
    
    if (isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        if (isUserMessage(authorType) && isTextMessage(contentType) && (sourceType != "api:conversations") ) {
            try {
                bot.replyToUser(
                    userMessage.toLowerCase(),
                    switchBoardMetadata
                );
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send(err.message);
            }
        }
        res.end();
    } 
}