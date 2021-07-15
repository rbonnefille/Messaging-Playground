/* eslint-disable new-cap */
const express = require('express');
const app = express();
const router = express.Router();
const messagingAction = require("../messaging");
app.use(express.json());

const {
    APP_ID: appId,
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_ID: botSwitchboardIntegration
} = process.env;

// middleware that is specific to this router
router.post("/switchboard", async (req, res) => {
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
    const activeSwitchboardIntegration = conversation.activeSwitchboardIntegration.id;
    const SwitchBoardMetadata = {
        surname: author.user?.profile?.surname,
        givenName: author.user?.profile?.givenName,
        email: author.user?.profile?.email,
        externalId: author.user?.externalId,
        eventSource: source.type
    };
    
    if (!isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        res.end();
    }

    if (isUserMessage(author.type) && isTextMessage(content.type)) {
        try {
            messagingAction.replyToUser(
                getEventType(messageEvent),
                appId,
                conversationId,
                SwitchBoardMetadata
            );
        } catch (err) {
            console.log("Error in message handler", err);
            res.status(500).send(err.message);
        }
    }
    res.end();
});

function isAuthenticatedRequest(webhookEventApiKey) {
    return webhookEventApiKey === webhookConversationsSecret;
}

function isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
    return activeSwitchboardIntegration === botSwitchboardIntegration;
}

// eslint-disable-next-line consistent-return
function getEventType(messageEvent) {
    switch (messageEvent.type) {
        case "conversation:message": {
            const {
                payload: {
                    message: { content },
                },
            } = messageEvent;
            const userMessage = content.text.toLowerCase();
            return userMessage;
        }
        case "conversation:postback": {
            const {payload: { postback }} = messageEvent;
            const userPostback = postback.payload;
            return userPostback;
        }
        default:
            console.log(messageEvent);
    }
}

function isUserMessage(author) {
    return author === "user";
}

function isTextMessage(content) {
    return content === "text";
}

module.exports = router;