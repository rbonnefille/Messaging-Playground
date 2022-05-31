/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isTextMessage } = require('./utils');
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

    const webhookEventApiKey = req.headers["x-api-key"];
  
    if (!isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }
  
    const { events: [ messageEvent ] } = req.body;
    const {
        payload: {
            conversation,
            message: { author, content, source },
        },
    } = messageEvent || {};
  
    const conversationId = conversation.id;
    const activeSwitchboardIntegration = conversation?.activeSwitchboardIntegration?.id || {};
    const userMessage = content?.text?.toLowerCase();
    const switchBoardMetadata = {
        givenName: author.user?.profile?.givenName,
        email: author.user?.profile?.email,
        externalId: author.user?.externalId,
        eventSource: source.type,
        conversation: conversationId
    };
 
    if (isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        if (isUserMessage(author.type) && isTextMessage(content.type)) {
            try {
                replyToUser(
                    userMessage,
                    appId,
                    conversationId,
                    switchBoardMetadata
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