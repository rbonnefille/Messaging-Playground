const express = require('express')
let messagingAction = require('./messaging');
const app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');  
app.use( express.json());

const integrationId = process.env.INTEGRATION_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;

function readUserMessage(userMessage) {
  switch (userMessage) {
    case 'hello':
    case 'hi':
    case 'hey':            
      messagingAction.sendMessageUser(appId, conversationId, "Hey there! You can send me 'agent','bot' .. and might reply to you 😆");
      break;
    case 'agent':
      messagingAction.passControl(appId, conversationId, "next");
      messagingAction.sendMessageUser(appId, conversationId, "Ok let me transfer you to a Zendesk agent.");
      break;
    case 'bot':
      messagingAction.sendMessageUser(appId, conversationId, "Ok but I am a bot!")
      break;
    default:
      messagingAction.sendMessageUser(appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?");
    }
  }

app.post("/:id", (req, res) => {
    var webhookEventType = req.body.events[0].type;
    var webhookPartyType = req.body.events[0].payload.message.author.type;
    var webhookEventApiKey = req.headers["x-api-key"];
    if (webhookEventApiKey === webhookSecret) {
        if (webhookEventType === "conversation:message" && webhookPartyType === "user") {
            var conversationId = req.body.events[0].payload.conversation.id;
            var appId = req.body.app.id;
            var userMessage = req.body.events[0].payload.message.content.text.toLowerCase();

            // Debugging with the console
            // console.log(conversationId);
            // console.log(userMessage);
            // console.log(appId);

            readUserMessage(userMessage);
            res.end();
        } else {
            // Debugging with the console
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