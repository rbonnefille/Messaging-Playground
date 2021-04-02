const express = require("express");
let messagingAction = require("./messaging");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const webhookSwitchtboardSecret = process.env.WEBHOOK_SWITCHBOARD_SECRET;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
const zdSwitchboardIntegration = process.env.ZD_SWITCHBOARD_ID;
const botSwitchboardIntegration = process.env.BOT_SWITCHBOARD_ID;
var conversationWithAgent;

app.post("/conversations", userMessageHandler);
app.post("/switchboard", switchboardWebhookHandler);
app.get("/web-messenger", function (req, res) {
  res.render("webSdk.ejs", { integrationId: integrationId });
});
app.use(function (req, res, next) {
  res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);

async function userMessageHandler(req, res) {
  const webhookEvent = req.body.events[0];
  const webhookEventType = webhookEvent.type;
  const webhookEventApiKey = req.headers["x-api-key"];
  const webhookEventAuthor = webhookEvent.payload.message.author.type;
  const conversationId = webhookEvent.payload.conversation.id;
  const activeSwitchboardIntegration = webhookEvent.payload.conversation.activeSwitchboardIntegration.id;
  const message = webhookEvent.payload.message;
  const appId = req.body.app.id;

  if (webhookEventApiKey === webhookConversationsSecret) {
    if (webhookEventType === "conversation:message" && webhookEventAuthor === "user" && conversationId != conversationWithAgent && activeSwitchboardIntegration === botSwitchboardIntegration) {
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
      console.log(`Webhook Event type is: ` + webhookEventType);
      console.log(`The message's Author is: ` + webhookEventAuthor);
      console.log(`Message coming from source: ` + webhookEvent.payload.message.source.type)
      console.log(`The message sent was ` + webhookEvent.payload.message.content.text);
      res.sendStatus(200);
      res.end();
    }
  } else {
    res.sendStatus(401);
    res.end();
  }
  res.end();
}

async function switchboardWebhookHandler(req, res) {
  const webhookEvent = req.body.events[0];
  const webhookEventType = webhookEvent.type;
  const webhookEventApiKey = req.headers["x-api-key"];
  const activeSwitchboardIntegration = webhookEvent.payload.conversation.activeSwitchboardIntegration.id;
  const conversationId = webhookEvent.payload.conversation.id;

  if (webhookEventApiKey === webhookSwitchtboardSecret) {
    if (activeSwitchboardIntegration === zdSwitchboardIntegration) {
      try {
        conversationWithAgent += conversationId;
        console.log(`The conversation ` + conversationId + ` is now handled by Zendesk`);
        res.end();
        //in progress//
        // be able to read each event like passControl and determine what to do.
      } catch (err) {
        console.log("Error in webhook handler", err);
        res.status(500).send(err.message);
      } 
    } else {
      try {
        messagingAction.sendMessageUser(appId, conversationId, "The conversation is now back with the Bot");
        console.log(`The conversation ` + conversationId + ` is now handled by the Bot`);
        res.end();
      } catch (err) {
        console.log("Error in webhook handler", err);
        res.status(500).send(err.message);
      } 
      
    }
  } else {
    res.sendStatus(401);
    res.end();
  }
  res.end();
}


