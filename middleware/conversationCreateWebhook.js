/* eslint-disable no-undef */
require("dotenv").config();
const { isConversationCreate, isCreationReasonStartConversation, isIgnoredChannel } = require("./webhookRequest");
const Bot = require("./bot");
const apikey =
    "Tx5G27N0ueQFg70mwH-rOfKGFWGWJne_Qi6xLWiVTXelOLRyy8AHm07rBDjvnh5kDyPbsh2JZJIUKUAGgUaqGg";

exports.createConversationWebhook = (req, res) => {
    console.log(JSON.stringify(req.body));

    const webhookEventApiKey = req.headers["x-api-key"];

    if (!apikey === webhookEventApiKey) {
        res.sendStatus(401);
    }

    const {
        app: { id: appId },
        events: [messageEvent],
    } = req.body;
    
    const {
        type: messageEventType,
        payload: {
            conversation: {
                id: conversationId
            },
            user: {
                externalId: externalId
            },
            creationReason,
            source: {
                type: sourceType,
                integrationId
            }
        }
    } = messageEvent || {};

    const bot = new Bot(appId, conversationId);

    switchBoardMetadata = {
        externalId: externalId
    };

    if (isConversationCreate(messageEventType) && isCreationReasonStartConversation(creationReason) && !isIgnoredChannel(sourceType)) {
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
