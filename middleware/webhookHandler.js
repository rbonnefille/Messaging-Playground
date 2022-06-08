/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isTextMessage } = require('./utils');
const WebhookRequest = require("./webhookRequest");
const { replyToUser } = require('./bot');
require('dotenv').config();

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];

const {
  APP_ID: appId,
  USERNAME: username,
  PASSWORD: password
} = process.env;

basicAuth.username = username;
basicAuth.password = password;

exports.webhookHandler = (req, res) => {
    
    const webhookRequest = new WebhookRequest(req);

    if (!isAuthenticatedRequest(webhookRequest.webhookEventApiKey)) {
        res.sendStatus(401);
    }
    // console.log(JSON.stringify(req.body));
 
    if (isCurrentSwitchboardIntegration(webhookRequest.activeSwitchboardIntegration)) {
        if (isUserMessage(webhookRequest.author.type) && isTextMessage(webhookRequest.content.type)) {
            try {
                replyToUser(
                    webhookRequest.userMessage,
                    appId,
                    webhookRequest.conversationId,
                    webhookRequest.switchBoardMetadata
                );
            } catch (err) {
                console.log("Error in message handler", err);
                res.status(500).send(err.message);
            }
        }
        res.end();
    } else {
        res.end();
    }
}