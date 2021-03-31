const express = require("express");
let messagingAction = require("./messaging");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const webhookIdSecret = process.env.WEBHOOK_ID_SECRET;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;

app.post("/conversations", (req, res) => {
    var webhookEventType = req.body.events[0].type;
    var webhookEventApiKey = req.headers["x-api-key"];
    var webhookEventAuthor = req.body.events[0].payload.message.author.type;
    
    if (webhookEventApiKey === webhookConversationsSecret) {
        if (webhookEventType === "conversation:message" && webhookEventAuthor === "user") {
            var conversationId = req.body.events[0].payload.conversation.id;
            var appId = req.body.app.id;
            var userMessage = req.body.events[0].payload.message.content.text.toLowerCase();
            messagingAction.readUserMessage(userMessage, appId, conversationId);
            res.end();
        }
        else {
          console.log(req.body);
          res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }
  });

app.post("/webhook", (req, res) => {
  var webhookEventType = req.body.events[0].type;
    var webhookEventApiKey = req.headers["x-api-key"];
    if (webhookEventApiKey === webhookIdSecret) {
        if (webhookEventType.includes("switchboard")) {
            console.log(req.body);
            res.sendStatus(200);
            //TO DO//
            // be able to read each event like passControl and determine what to do.
        }
        else{
          console.log(req.body);
          res.sendStatus(200);
        }
    } else {
        res.sendStatus(401);
    }
});
app.get("/web-messenger", function (req, res) {
    res.render("webSdk.ejs", { integrationId: integrationId });
});
app.use(function (req, res, next) {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);