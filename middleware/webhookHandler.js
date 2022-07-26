/* eslint-disable no-undef */
require('dotenv').config();
const WebhookRequest = require("./webhookRequest");
const Bot = require('./bot');

const {
  APP_ID: appId
} = process.env;

exports.webhookHandler = (req, res) => {
    
    const webhookRequest = new WebhookRequest(req);
    const bot = new Bot(appId, webhookRequest.conversationId);

    if (!webhookRequest.isAuthenticatedRequest(webhookRequest.webhookEventApiKey)) {
        res.sendStatus(401);
    }
    // console.log(JSON.stringify(req.body));
 
    if (webhookRequest.isCurrentSwitchboardIntegration(webhookRequest.activeSwitchboardIntegration)) {
        if (webhookRequest.isConversationCreate(webhookRequest.messageEventType) && !webhookRequest.isIgnoredChannel(webhookRequest.sourceType)) {
            try {
                bot.replyToUser(
                    "start",
                    webhookRequest.switchBoardMetadata
                );
                res.end();
            } catch (error) {
                console.log(error);
                res.status(500).send(err.message);
            }
            res.end();
        } else if (webhookRequest.isUserMessage(webhookRequest.authorType) && webhookRequest.isTextMessage(webhookRequest.contentType) && (webhookRequest.sourceType != "api:conversations") ) {
            try {
                bot.replyToUser(
                    webhookRequest.userMessage,
                    webhookRequest.switchBoardMetadata
                );
            } catch (err) {
                console.log("Error in message handler", err);
                res.status(500).send(err.message);
            }
        }
        res.end();
    } 
}