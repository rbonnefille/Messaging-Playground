const express = require("express");
let messagingAction = require("./messaging");
const app = express();
const ejs = require("ejs");
app.set("view engine", "ejs");
app.use(express.json());

const {
    APP_ID: appId,
    INTEGRATION_ID: integrationId,
    sdkVersion: SDK_VERSION,
    webhookConversationsSecret: WEBHOOK_CONVERSATIONS_SECRET,
    botSwitchboardIntegration: BOT_SWITCHBOARD_ID,
    webhookPostbacksSecret: WEBHOOK_POSTBACKS_SECRET,
} = process.env;

const webhookEventApiKey = req.headers["x-api-key"];

app.post("/switchboard", userMessageHandler);

app.post("/postbacks", postbackHandler);

app.get("/web-messenger", function (req, res) {
    res.render("webSdk.ejs", {
        integrationId: integrationId,
        sdkVersion: sdkVersion,
    });
});
app.use(function (req, res, next) {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);

async function userMessageHandler(req, res) {
    const webhookEvent = req.body.events[0];
    const webhookEventType = webhookEvent.type;
    const message = webhookEvent.payload.message;
    const webhookEventContentType = message.content.type;
    const webhookEventAuthor = message.author.type;
    const conversationId = webhookEvent.payload.conversation.id;
    const activeSwitchboardIntegration =
        webhookEvent.payload.conversation.activeSwitchboardIntegration.id;

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
            console.log(`Webhook Event type is: ` + webhookEventType);
            console.log(`The message's Author is: ` + webhookEventAuthor);
            console.log(
                `Message coming from source: ` +
                    webhookEvent.payload.message.source.type
            );
            console.log(
                `The message sent was ` +
                    webhookEvent.payload.message.content.type
            );
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }
    res.end();
}
async function postbackHandler(req, res) {
  webhookEventApiKey === webhookConversationsSecret;
  const webhookEvent = req.body.events[0];
  const webhookEventType = webhookEvent.type;
  const userPostback = webhookEvent.payload.postback.payload;
  const conversationId = webhookEvent.payload.conversation.id;

  if (webhookEventApiKey === webhookConversationsSecret) {
      if (webhookEventType === "conversation:postback") {
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