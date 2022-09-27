/* eslint-disable no-undef */
require("dotenv").config();
const Bot = require("../models/bot");
const ConversationCreate = require("../models/webhook").ConversationCreate;
const PassControlMetadata = require('./passControlMetadata');


exports.conversationCreate = (req, res) => {
    console.log(JSON.stringify(req.body));

    const webhookCreate = new ConversationCreate(req);

    if (!webhookCreate.isNotAuthenticatedRequest(webhookCreate.webhookEventApiKey)) {
        res.sendStatus(401);
        return;
    }

    const bot = new Bot(webhookCreate.appId, webhookCreate.conversationId);
    const metadata = new PassControlMetadata(webhookCreate);


    if (webhookCreate.isConversationCreate(webhookCreate.eventType) && webhookCreate.isCreationReasonStartConversation(webhookCreate.creationReason) && webhookCreate.isAllowedChannel(webhookCreate.sourceType)) {
        try {
            bot.replyToUser("start", metadata);
            res.end();
        } catch (error) {
            console.log(error);
            res.status(500).send(err.message);
        }
        res.end();
    }
};
