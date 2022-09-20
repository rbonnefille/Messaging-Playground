/* eslint-disable no-undef */
require('dotenv').config();
const Bot = require('./bot');
const PassControlMetadata = require('./passControlMetadata');
const ConversationMessage = require('./webhook').ConversationMessage;

exports.conversationMessageWebhook = (req, res) => {
    console.log("##########################");
    console.log(JSON.stringify(req.body));

    const webhookEventApiKey = req.headers["x-api-key"];

    const webhookMessage = new ConversationMessage(req.body);

    if (!webhookMessage.isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }

    if (!webhookMessage.isUserMessage(webhookMessage.authorType)){
        res.sendStatus(200);
        res.end();
    }

    const metadata = new PassControlMetadata(webhookMessage);
    const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);
    
    if (webhookMessage.isCurrentSwitchboardIntegration(webhookMessage.activeSwitchboardIntegrationId)) {
        if (webhookMessage.isTextMessage(webhookMessage.contentType) && (webhookMessage.sourceType != "api:conversations") ) {
            try {
                bot.replyToUser(
                    webhookMessage.userMessage.toLowerCase(),
                    metadata
                );
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send(err.message);
            }
        }
        res.end();
    } 
}
    // Desctructre the request body
    // const {
    //     app: { id: appId } ,
    //     events: [messageEvent],
    // } = req.body;
    
    // const {
    //     type: messageEventType,
    //     payload: {
    //         conversation: {
    //             id: conversationId,
    //             activeSwitchboardIntegration: {
    //                 id: activeSwitchboardIntegrationId,
    //             } = {},
    //         },
    //         message: {
    //             author: { userId, displayName: displayName, type: authorType, user: { externalId, profile: { surname, givenName, email, locale } } } = {},
    //             content: { text: userMessage, type: contentType, payload: contentPayload } = { text: "hi", type: "text", payload: "hi" },
    //             source: { integrationId: sourceIntegrationId , type: sourceType },
    //         } = {},
    //     },
    // } = messageEvent || {};