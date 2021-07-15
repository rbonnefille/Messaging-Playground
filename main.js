const express = require("express");
const app = express();
// eslint-disable-next-line no-unused-vars
app.set("view engine", "ejs");
const webhookHandler = require('./webhookHandler');


const {
    INTEGRATION_ID: integrationId,
    SDK_VERSION: sdkVersion
} = process.env;

app.use("/switchboard", webhookHandler);

app.get("/web-messenger", (req, res) => {
    res.render("webSdk.ejs", {
        integrationId: integrationId,
        sdkVersion: sdkVersion,
    });
});
app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);


