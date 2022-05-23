const express = require("express");
const webhook = require("./middleware/webhook");
const auth = require("./middleware/auth");

require('dotenv').config();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static('public'));

app.post("/switchboard", webhook.webhookHandler);

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/auth", auth.returnToken);

app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);