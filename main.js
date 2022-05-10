const express = require("express");
const messagingAction = require("./messaging");

require('dotenv').config();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static('assets'));

app.post("/switchboard", messagingAction.webhookHandler);

app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);