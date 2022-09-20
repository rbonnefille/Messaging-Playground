const express = require("express");
const { conversationMessageWebhook } = require("./middleware/conversationMessageWebhook");
const { createConversationWebhook } = require("./middleware/conversationCreateWebhook");
const { returnToken } = require("./middleware/auth");

require("dotenv").config();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/public", express.static("public"));

const { BROWSER_SESSION_STORAGE_KEY: sessionStorageKey } = process.env;

app.post("/switchboard", conversationMessageWebhook);

app.post("/conversationCreate", createConversationWebhook);

app.get("/", (req, res) => {
    res.render("index.ejs", { sessionStorageKey: sessionStorageKey });
});

app.get("/integrationweb2", (req, res) => {
    res.render("integrationweb2.ejs", { sessionStorageKey: sessionStorageKey });
});

app.post("/auth", returnToken);

app.use((req, res) => {
    res.status(404).render("404.ejs");
});
app.listen(process.env.PORT || 7777);
