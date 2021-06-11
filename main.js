const express = require("express");
let switchboard = require("./switchboard.js");
const app = express();
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.json());

const integrationId = process.env.INTEGRATION_ID;
const sdkVersion = process.env.SDK_VERSION;
const webhookConversationsSecret = process.env.WEBHOOK_CONVERSATIONS_SECRET;
const botSwitchboardIntegration = process.env.BOT_SWITCHBOARD_ID;

app.use('/switchboard', switchboard);

app.get("/web-messenger", function (req, res) {
  res.render("webSdk.ejs", { integrationId: integrationId , sdkVersion: sdkVersion });
});

app.use(function (req, res, next) {
  res.status(404).render("404.ejs");
});

app.listen(process.env.PORT || 7777);



