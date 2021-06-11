const express = require("express");
let messagingAction = require("./messaging");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const sdkVersion = process.env.SDK_VERSION;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
const botSwitchboardIntegration = process.env.BOT_SWITCHBOARD_ID;

app.post("/switchboard", userMessageHandler);
app.get("/web-messenger", function (req, res) {
  res.render("webSdk.ejs", { integrationId: integrationId , sdkVersion: sdkVersion });
});
app.use(function (req, res, next) {
  res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);

async function userMessageHandler(req, res) {
  const webhookEvent = req.body.events[0];
  const webhookEventType = webhookEvent.type;
  const webhookEventPayload = webhookEvent.payload;
  const webhookEventApiKey = req.headers["x-api-key"];
  const webhookEventPayloadMessage = webhookEventPayloadMessage;
  const webhookEventAuthor = webhookEventPayloadMessage.author.type;
  const webhookEventContentType = webhookEventPayloadMessage.content.type;
  const conversationId = webhookEventPayload.conversation.id;
  const activeSwitchboardIntegration = webhookEventPayload.conversation.activeSwitchboardIntegration.id;
  const message = webhookEventPayloadMessage;
  const appId = req.body.app.id;

  if (webhookEventApiKey === webhookConversationsSecret) {
    if (webhookEventType === "conversation:message" && webhookEventAuthor === "user" && activeSwitchboardIntegration === botSwitchboardIntegration && webhookEventContentType === "text") {
      try {
        const userMessage = message.content.text.toLowerCase();
        messagingAction.readUserMessage(userMessage, appId, conversationId);
      } catch (err) {
        console.log("Error in message handler", err);
        res.status(500).send(err.message);
      }
      res.end();
    }
    else {
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(401);
  }
  res.end();
}


