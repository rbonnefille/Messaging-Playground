const express = require('express')
let messagingAction = require('./messaging');
const app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');  
app.use( express.json());

const integrationId = process.env.INTEGRATION_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;


app.post("/:id", (req, res) => {
    var webhookEventType = req.body.events[0].type;
    console.log(webhookEventType);
    var webhookPartyType = req.body.events[0].payload.message.author.type;
    var webhookEventApiKey = req.headers["x-api-key"];
    if (webhookEventApiKey === webhookSecret) {
        if (webhookEventType === 'conversation:message' && webhookPartyType === 'user') {
            var conversationId = req.body.events[0].payload.conversation.id;
            var appId = req.body.app.id;
            var userMessage = req.body.events[0].payload.message.content.text.toLowerCase();
            messagingAction.readUserMessage(userMessage, appId, conversationId);
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


//body.events[0].payload.message.content.type