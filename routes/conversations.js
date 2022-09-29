const Bot = require("../models/bot");
const { ConversationCreate, ConversationMessage } = require("../models/webhook");
const PassControlMetadata = require('../models/passControlMetadata');
const logger = require("../utils/logger");
const express = require("express");
const router = express.Router();

router.use(logger);

router.post("/messages", (req, res) => {
    const webhookMessage = new ConversationMessage(req);

    if (!webhookMessage.isNotAuthenticatedRequest(webhookMessage.webhookEventApiKey)) {
        res.sendStatus(401);
        return;
    }

    if (webhookMessage.isBusinessMessage(webhookMessage.authorType)){
        res.sendStatus(200);
        res.end();
    }

    const metadata = new PassControlMetadata(webhookMessage);
    const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);
    
    if (webhookMessage.isCurrentSwitchboardIntegration(webhookMessage.activeSwitchboardIntegrationId)) {
        if (webhookMessage.isTextMessage(webhookMessage.contentType) && (webhookMessage.isAllowedChannel(webhookMessage.sourceType)) ) {
            try {
                if (webhookMessage.payload) {
                    bot.replyToUser(
                        webhookMessage.payload.toLowerCase(),
                        metadata
                    );
                } else {
                    bot.replyToUser(
                        webhookMessage.userMessage.toLowerCase(),
                        metadata
                    );
                }
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send(err.message);
            }
        }
        res.end();
    } 
});

router.post("/creates", (req, res) => {
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
});

module.exports = router;