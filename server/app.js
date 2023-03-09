import * as dotenv from 'dotenv';
dotenv.config();
import express from "express";
import path from "path";
import favicon from "serve-favicon";
import { fileURLToPath } from 'url';
import returnToken from "./utils/auth.js"
import conversationRouter from "./routes/conversations.js";
import userRouter from "./routes/users.js";
import integrationRouter from "./routes/integrations.js";
// import { dialogFlow } from "./routes/dialogFlow.js";
import * as helmet from "helmet";
const { BROWSER_SESSION_STORAGE_KEY: sessionStorageKey, MESSAGING_WIDGET_KEY: messagingWidgetKey, SUNCO_INTEGRATION_ID: suncoIntegrationId } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());

app.set("view engine", "ejs");
app.use(express.json());
app.use("/public", express.static("public"));
app.use(favicon(path.join(__dirname, 'public', 'assets', 'favicon.ico')))

app.use("/conversations", conversationRouter);

// app.use("/gdf", dialogFlow);

app.use("/integrations", integrationRouter);

app.use("/users", userRouter);

app.post("/auth", returnToken);

app.get("/", (_, res) => {
    res.render("index.ejs", { sessionStorageKey: sessionStorageKey, messagingWidgetKey: messagingWidgetKey, suncoIntegrationId: suncoIntegrationId });
});

app.get("/integrationweb2", (_, res) => {
    res.render("integrationweb2.ejs", { sessionStorageKey: sessionStorageKey });
});

app.use((_, res) => {
    res.status(404).render("404.ejs");
});

app.listen((process.env.PORT ?? 3000), () => console.log(`Server is running on port ${process.env.PORT ?? 3000}`));
