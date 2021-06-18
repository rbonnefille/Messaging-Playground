import express, { json } from "express";
import { readUserMessage } from "./messaging.js";
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(json());

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
  const webhookEventApiKey = req.headers["x-api-key"];
  const message = webhookEvent.payload.message;
  const webhookEventContentType = message.content.type;
  const webhookEventAuthor = message.author.type;
  const conversationId = webhookEvent.payload.conversation.id;
  const activeSwitchboardIntegration = webhookEvent.payload.conversation.activeSwitchboardIntegration.id;
  const appId = req.body.app.id;
  
  if (webhookEventApiKey === webhookConversationsSecret) {
    if (webhookEventType === "conversation:message" && webhookEventAuthor === "user" && activeSwitchboardIntegration === botSwitchboardIntegration && webhookEventContentType === "text") {
      try {
        const userMessage = message.content.text.toLowerCase();
        readUserMessage(userMessage, appId, conversationId);
      } catch (err) {
        console.log("Error in message handler", err);
        res.status(500).send(err.message);
      }
      res.end();
    }
    else {
      console.log(`Webhook Event type is: ` + webhookEventType);
      console.log(`The message's Author is: ` + webhookEventAuthor);
      console.log(`Message coming from source: ` + webhookEvent.payload.message.source.type)
      console.log(`The message sent was ` + webhookEvent.payload.message.content.type);
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(401);
  }
  res.end();
}


