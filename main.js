const express = require("express");
let messagingAction = require("./messaging");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const sdkVersion = process.env.SDK_VERSION;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
const botSwitchboardIntegration = process.env.BOT_SWITCHBOARD_ID;
//var conversationWithAgent;

app.post("/switchboard", userMessageHandler);
app.get("/web-messenger", function (req, res) {
  res.render("webSdk.ejs", { integrationId: integrationId , sdkVersion: sdkVersion });
});
app.use(function (req, res, next) {
  res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);


function validateWebhookSecret(req) {
  const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
  const webhookEventApiKey = req.headers["x-api-key"];
  if (webhookEventApiKey !== webhookConversationsSecret) {
      throw new Error("Invalid secret.");
  }
}

async function userMessageHandler(req, res) {
  const webhookEvent = req.body.events[0];
  const webhookEventType = webhookEvent.type;
  const webhookEventApiKey = req.headers["x-api-key"];
  const webhookEventAuthor = webhookEvent.payload.message.author.type;
  const conversationId = webhookEvent.payload.conversation.id;
  const activeSwitchboardIntegration = webhookEvent.payload.conversation.activeSwitchboardIntegration.id;
  const message = webhookEvent.payload.message;
  const appId = req.body.app.id;

  console.log(validateWebhookSecret(webhookEvent));

  if (webhookEventApiKey === webhookConversationsSecret) {
    if (webhookEventType === "conversation:message" && webhookEventAuthor === "user" && activeSwitchboardIntegration === botSwitchboardIntegration) {
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


