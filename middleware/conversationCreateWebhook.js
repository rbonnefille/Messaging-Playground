/* eslint-disable no-undef */
require("dotenv").config();
const Bot = require("./bot");
const ConversationCreate = require("./webhook").ConversationCreate;


exports.createConversationWebhook = (req, res) => {
    console.log(JSON.stringify(req.body));

    const webhookCreate = new ConversationCreate(req);

    if (!webhookCreate.isAuthenticatedRequest(webhookCreate.webhookEventApiKey)) {
        res.sendStatus(401);
        return;
    }

    // const {
    //     app: { id: appId },
    //     events: [messageEvent],
    // } = req.body;
    
    // const {
    //     type: messageEventType,
    //     payload: {
    //         conversation: {
    //             id: conversationId
    //         },
    //         user: {
    //             externalId: externalId
    //         },
    //         creationReason,
    //         source: {
    //             type: sourceType,
    //             integrationId
    //         }
    //     }
    // } = messageEvent || {};

    const bot = new Bot(webhookCreate.appId, webhookCreate.conversationId);

    switchBoardMetadata = {
        externalId: webhookCreate.userExternalId
    };

    if (webhookCreate.isConversationCreate(webhookCreate.eventType) && webhookCreate.isCreationReasonStartConversation(webhookCreate.creationReason) && !webhookCreate.isIgnoredChannel(webhookCreate.sourceType)) {
        try {
            bot.replyToUser("start", switchBoardMetadata);
            res.end();
        } catch (error) {
            console.log(error);
            res.status(500).send(err.message);
        }
        res.end();
    }
};
