import * as dotenv from 'dotenv'
dotenv.config()
import express from "express";
import returnToken from "./utils/auth.js"
import conversationRouter from "./routes/conversations.js";
import userRouter from "./routes/users.js";
import integrationRouter from "./routes/integrations.js";
// import { dialogFlow } from "./routes/dialogFlow.js";
const { BROWSER_SESSION_STORAGE_KEY: sessionStorageKey } = process.env;

const app = express();
app.set("view engine", "ejs");
app.use(express.json());
app.use("/public", express.static("public"));

app.use("/conversations", conversationRouter);

// app.use("/gdf", dialogFlow);

app.use("/integrations", integrationRouter);

app.use("/users", userRouter);

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
