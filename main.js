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

// function isAuthenticatedRequest(webhookEventApiKey) {
//     return webhookEventApiKey === webhookConversationsSecret;
// }

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

// eslint-disable-next-line max-lines-per-function
async function webhookHandler(req, res) {

    // const webhookEventApiKey = req.headers["x-api-key"];

    // if (!isAuthenticatedRequest(webhookEventApiKey)) {
    //     res.sendStatus(401);
    // }

    const { events: [ messageEvent ] } = req.body;
    const {
        payload: {
            conversation,
            message: { author, content },
        },
    } = messageEvent || {};

    const conversationId = conversation.id;
    const activeSwitchboardIntegration = conversation.activeSwitchboardIntegration.id;
    const externalId = author.user.externalId;
    
    if (!isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
        res.sendStatus(200);
    }

    if (isUserMessage(author.type) && isTextMessage(content.type)) {
        try {
            messagingAction.replyToUser(
                getEventType(messageEvent),
                appId,
                conversationId,
                externalId
            );
        } catch (err) {
            console.log("Error in message handler", err);
            res.status(500).send(err.message);
        }
    }
    res.end();
}
