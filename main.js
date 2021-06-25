const express = require("express");
let messagingAction = require("./messaging");
const app = express();
// eslint-disable-next-line no-unused-vars
const ejs = require("ejs");
app.set("view engine", "ejs");
app.use(express.json());

const {
    APP_ID: appId,
    INTEGRATION_ID: integrationId,
    SDK_VERSION: sdkVersion,
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_ID: botSwitchboardIntegration,
    WEBHOOK_POSTBACKS_SECRET: webhookPostbacksSecret
// eslint-disable-next-line no-undef
} = process.env;

app.post("/switchboard", userMessageHandler);

app.post("/postbacks", postbackHandler);

app.get("/web-messenger", function (req, res) {
    res.render("webSdk.ejs", {
        integrationId: integrationId,
        sdkVersion: sdkVersion,
    });
});
app.use(function (req, res) {
    res.status(404).render("404.ejs");
});
// eslint-disable-next-line no-undef
app.listen(process.env.PORT || 7777);

async function userMessageHandler(req, res) {
    const webhookEventApiKey = req.headers["x-api-key"];
    const { app , webhookId , events: [ messageEvent ]} = req.body;
    const {payload: {conversation,message: { author , content, source } }} = messageEvent;
    const conversationId = conversation.id;
    const activeSwitchboardIntegration = conversation.activeSwitchboardIntegration.id;

    if (webhookEventApiKey === webhookConversationsSecret) {
        if (
            messageEvent.type === "conversation:message" &&
            author === "user" &&
            activeSwitchboardIntegration === botSwitchboardIntegration &&
            content.type === "text"
        ) {
            try {
                const userMessage = content.text.toLowerCase();
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
            console.log(`Webhook Event type is: ` + messageEvent.type);
            console.log(`The message's Author is: ` + author);
            console.log(
                `Message coming from source: ` +
                    source.type
            );
            console.log(
                `The message sent was ` + content.type
            );
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }
    res.end();
}

async function postbackHandler(req, res) {
    const webhookEventApiKey = req.headers["x-api-key"];
    const { app , webhookId , events: [ messageEvent ]} = req.body;
    const {payload: {conversation,postback,user,source }} = messageEvent;
    const userPostback = postback.payload;
    const conversationId = conversation.id;

    if (webhookEventApiKey === webhookPostbacksSecret) {
        if (messageEvent.type === "conversation:postback") {
            try {
                const userMessage = userPostback.toLowerCase();
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
        }
    } else {
        res.sendStatus(401);
    }
    res.end();
}
