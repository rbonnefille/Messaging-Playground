/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const Utils = require('./utils');
const WebhookRequest = require("./webhookRequest");
const Bot = require('./bot');
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
    const utils = new Utils();
    const bot = new Bot();

    if (!utils.isAuthenticatedRequest(webhookRequest.webhookEventApiKey)) {
        res.sendStatus(401);
    }
    // console.log(JSON.stringify(req.body));
 
    if (utils.isCurrentSwitchboardIntegration(webhookRequest.activeSwitchboardIntegration)) {
        if (webhookRequest.messageEventType === "conversation:create") {
            try {
                bot.replyToUser(
                    "hi",
                    appId,
                    webhookRequest.conversationId,
                    webhookRequest.switchBoardMetadata
                );
                res.end();
            } catch (error) {
                console.log(error);
                res.status(500).send(err.message);
            }
            res.end();
        } else if (utils.isUserMessage(webhookRequest.author.type) && utils.isTextMessage(webhookRequest.content.type) && webhookRequest.source.type != "twitter") {
            try {
                bot.replyToUser(
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
    } 
}