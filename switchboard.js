var express = require('express');
var router = express.Router();
let messagingAction = require("./messaging.js");

router.post("/switchboard", function (req, res) {
    const webhookEvent = req.body.events[0];
    const webhookEventType = webhookEvent.type;
    const webhookEventApiKey = req.headers["x-api-key"];
    const message = webhookEvent.payload.message;
    const webhookEventContentType = message.content.type;
    const webhookEventAuthor = message.author.type;
    const conversationId = webhookEvent.payload.conversation.id;
    const activeSwitchboardIntegration =
        webhookEvent.payload.conversation.activeSwitchboardIntegration.id;
    const appId = req.body.app.id;

    if (webhookEventApiKey === webhookConversationsSecret) {
        if (
            webhookEventType === "conversation:message" &&
            webhookEventAuthor === "user" &&
            activeSwitchboardIntegration === botSwitchboardIntegration &&
            webhookEventContentType === "text"
        ) {
            try {
                const userMessage = message.content.text.toLowerCase();
                messagingAction.readUserMessage(
                    userMessage,
                    appId,
                    conversationId
                );
            } catch (err) {
                console.log("Error in message handler", err);
                res.status(500).send(err.message);
            }
            res.end();
        } else {
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }
    res.end();
});

module.exports = router;
