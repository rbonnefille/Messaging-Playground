const express = require("express");
const { returnToken } = require("./utils/auth");
const conversationRouter = require("./routes/conversations");
const userRouter = require("./routes/users");
const integrationRouter = require("./routes/integrations");
const dialogFlow = require("./routes/dialogFlow");
const { BROWSER_SESSION_STORAGE_KEY: sessionStorageKey } = process.env;

require("dotenv").config();
const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/public", express.static("public"));

app.use("/conversations", conversationRouter);

app.use("/gdf", dialogFlow);

app.use("/integrations", integrationRouter);

app.use("/user", userRouter);

app.post("/auth", returnToken);

app.get("/", (req, res) => {
    res.render("index.ejs", { sessionStorageKey: sessionStorageKey });
});

app.get("/integrationweb2", (req, res) => {
    res.render("integrationweb2.ejs", { sessionStorageKey: sessionStorageKey });
});

app.use((req, res) => {
    res.status(404).render("404.ejs");
});

app.listen(process.env.PORT || 7777);
