const express = require("express");
let messagingAction = require("./messaging");
const app = express();
// eslint-disable-next-line no-unused-vars
app.set("view engine", "ejs");
app.use(express.json());

const {
    APP_ID: appId,
    INTEGRATION_ID: integrationId,
    SDK_VERSION: sdkVersion,
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_ID: botSwitchboardIntegration,
} = process.env;

app.post("/switchboard", webhookHandler);

app.get("/web-messenger", (req, res) => {
    res.render("webSdk.ejs", {
        integrationId: integrationId,
        sdkVersion: sdkVersion,
    });
});
app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);

function isAuthenticatedRequest(webhookEventApiKey) {
    return webhookEventApiKey === webhookConversationsSecret;
}

function isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
    return activeSwitchboardIntegration === botSwitchboardIntegration;
}

// eslint-disable-next-line consistent-return
function getUserMessage(messageEvent) {
    let userMessage = "";
    if (messageEvent.type === "conversation:message") {
        const {
            payload: {
                message: { content },
            },
        } = messageEvent;
        userMessage = content.text.toLowerCase();
    } else {
        const {
            payload: { postback },
        } = messageEvent;
        userMessage = postback.payload;
    }
    return userMessage;
}

function isUserMessage(author) {
    return author === "user";
}

function isTextMessage(content) {
    return content === "text";
}

async function webhookHandler(req, res) {
    const webhookEventApiKey = req.headers["x-api-key"];
    const { events: [ messageEvent ] } = req.body;
    const payload = messageEvent.payload;
    const message = payload.message || {};
    const source = payload.source?.type;
    const messageContent = message?.content?.text?.toLowerCase() || {};
    const contentType = messageContent.type || {};
    const author = message?.author?.type;
    const conversationId = payload.conversation.id;
    const activeSwitchboardIntegration = payload.conversation.activeSwitchboardIntegration.id;


    const SwitchBoardMetadata = {
        surname: author.user?.profile?.surname,
        givenName: author.user?.profile?.givenName,
        email: author.user?.profile?.email,
        externalId: author.user?.externalId,
        eventSource: source,
    };

    if (!isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }

    if (!isUserMessage(author) && !isTextMessage(contentType)) {
        res.end();
    }

    if (!isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        res.end();
    }

    try {
        messagingAction.replyToUser(
            getUserMessage(messageEvent),
            appId,
            conversationId,
            SwitchBoardMetadata
        );
        res.end();
    } catch (err) {
        console.log("Error in message handler", err);
        res.status(500).send(err.message);
    }
    res.end();
}
