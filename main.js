const express = require("express");
const { webhookHandler } = require("./middleware/webhook");
const { returnToken } = require("./middleware/auth");

require('dotenv').config();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use('/public', express.static('public'));

app.post("/switchboard", webhookHandler);

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/auth", returnToken);

app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);