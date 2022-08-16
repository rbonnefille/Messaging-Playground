/* eslint-disable no-undef */
require('dotenv').config();
const { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isTextMessage } = require("./webhookRequest");
const Bot = require('./bot');

exports.webhookHandler = (req, res) => {

    console.log(JSON.stringify(req.body));

    const webhookEventApiKey = req.headers["x-api-key"];

    if (!isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }

    if (!isUserMessage(req.body.events[0].payload.message.author.type)){
        res.sendStatus(200);
        res.end();
        return;
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
                author: { userId, displayName: displayName, type: authorType, user: { externalId, profile: { surname, givenName, email, locale } } } = {},
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
        if (isTextMessage(contentType) && (sourceType != "api:conversations") ) {
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