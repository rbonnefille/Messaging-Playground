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
    BOT_SWITCHBOARD_ID: botSwitchboardIntegration
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

function isUserMessage(author) {
    return author === "user";
}

function isTextMessage(content) {
    return content === "text";
}

// eslint-disable-next-line max-lines-per-function
async function webhookHandler(req, res) {

    const webhookEventApiKey = req.headers["x-api-key"];

    if (!isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401);
    }

    // const { events: [ messageEvent ] } = req.body;
    // const {
    //     payload: {
    //         conversation,
    //         message: { author, content, source },
    //     },
    // } = messageEvent || {};

    const event = req.body.events[0];
    const eventType = event.type;
    const payload = event.payload;

    const message = payload.message || {};
    const postback = payload.postback?.payload;
    const source = payload.source?.type;
    const messageContent = message?.content?.text?.toLowerCase() || {};
    const contentType = messageContent.type || {};
    const author = message?.author?.type;
    const conversationId = payload.conversation.id;
    const activeSwitchboardIntegration = payload.conversation.activeSwitchboardIntegration.id;

    // const conversationId = conversation.id;
    // const activeSwitchboardIntegration = conversation.activeSwitchboardIntegration.id;
    const SwitchBoardMetadata = {
        surname: author.user?.profile?.surname,
        givenName: author.user?.profile?.givenName,
        email: author.user?.profile?.email,
        externalId: author.user?.externalId,
        eventSource: source
    };
    
    if (!isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        res.end();
    }

    if (isUserMessage(author) && isTextMessage(contentType)) {
        try {
            switch (eventType) {
                case "conversation:message":
                    messagingAction.replyToUser(
                        messageContent,
                        appId,
                        conversationId,
                        SwitchBoardMetadata
                    );
                    break;
                case "conversation:postback":
                    messagingAction.replyToUser(
                        postback,
                        appId,
                        conversationId,
                        SwitchBoardMetadata
                    );
                    break;
                default:
                    break;
            }            
        } catch (err) {
            console.log("Error in message handler", err);
            res.status(500).send(err.message);
        }
    }
    res.end();
}