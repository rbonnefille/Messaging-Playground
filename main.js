const express = require("express");
let messagingAction = require("./messaging");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const webhookSwitchtboardSecret = process.env.WEBHOOK_SWITCHBOARD_SECRET;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
var zdSwitchboardIntegration = process.env.ZD_SWITCHBOARD_ID;
var botSwitchboardIntegration = process.env.BOT_SWITCHBOARD_ID;
var conversationWithAgent;

app.post("/conversations", (req, res) => {
  var webhookEventType = req.body.events[0].type;
  var webhookEventApiKey = req.headers["x-api-key"];
  var webhookEventAuthor = req.body.events[0].payload.message.author.type;
  var conversationId = req.body.events[0].payload.conversation.id;
  var activeSwitchboardIntegration = req.body.events[0].payload.conversation.activeSwitchboardIntegration.id;
  var appId = req.body.app.id;

  if (webhookEventApiKey === webhookConversationsSecret) {
    if (webhookEventType === "conversation:message" && webhookEventAuthor === "user" && conversationId != conversationWithAgent && activeSwitchboardIntegration === botSwitchboardIntegration) {
      var userMessage = req.body.events[0].payload.message.content.text.toLowerCase();
      messagingAction.readUserMessage(userMessage, appId, conversationId);
      res.end();
    }
    else {
      console.log(`Webhook Event type is: ` + webhookEventType);
      console.log(`The message's Author is: ` + webhookEventAuthor);
      console.log(`Message coming from source: ` + req.body.events[0].payload.message.source.type)
      console.log(`The message sent was ` + req.body.events[0].payload.message.content.text);
      res.sendStatus(200);
      res.end();
    }
  } else {
    res.sendStatus(401);
    res.end();
  }
});

app.post("/switchboard", (req, res) => {
  var webhookEventType = req.body.events[0].type;
  var webhookEventApiKey = req.headers["x-api-key"];
  var activeSwitchboardIntegration = req.body.events[0].payload.conversation.activeSwitchboardIntegration.id;
  var conversationId = req.body.events[0].payload.conversation.id;

  if (webhookEventApiKey === webhookSwitchtboardSecret) {
    if (webhookEventType === 'switchboard:passControl' && activeSwitchboardIntegration === zdSwitchboardIntegration) {
      conversationWithAgent += conversationId;
      console.log(`The conversation ` + conversationId + ` is now handled by Zendesk`);
      res.sendStatus(200);
      res.end();
      //in progress//
      // be able to read each event like passControl and determine what to do.
    // } else if (webhookEventType.includes("failure")) {
    //   console.log(req.body.events[0].payload);
    //   res.sendStatus(200);
    //   res.end();
    } else if (webhookEventType === 'switchboard:passControl' && activeSwitchboardIntegration === botSwitchboardIntegration) {
      messagingAction.acceptControl(appId, conversationId);
      res.end();
    }
  } else {
    res.sendStatus(401);
    res.end();
  }
});
app.get("/web-messenger", function (req, res) {
  res.render("webSdk.ejs", { integrationId: integrationId });
});
app.use(function (req, res, next) {
  res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);