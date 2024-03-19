import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
// import favicon from "serve-favicon";
import { fileURLToPath } from 'url';
import returnToken from './utils/auth.js';
import conversationRouter from './routes/conversations.js';
import userRouter from './routes/users.js';
import integrationRouter from './routes/integrations.js';
import zendeskRouter from './routes/zendesk.js';
import notififactionRouter from './routes/notifications.js';
import loggerMiddleware from './utils/logger.js';
// import { dialogFlow } from "./routes/dialogFlow.js";
import chatToken from './routes/chat.js';

import * as helmet from 'helmet';
import cors from 'cors';

const {
  BROWSER_SESSION_STORAGE_KEY: sessionStorageKey,
  MESSAGING_WIDGET_KEY: messagingWidgetKey,
  SUNCO_INTEGRATION_ID: suncoIntegrationId,
  ZD_SUBDOMAIN: zdSubdomain,
  ZD_APP_GUID: zdAppGuid,
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(loggerMiddleware);
app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(express.json());

// FOR EJS //

// app.set("view engine", "ejs");
// app.use("/public", express.static("public"));
// app.use(favicon(path.join(__dirname, "public", "assets", "favicon.ico")));

app.use(express.urlencoded({ extended: false }));

// FOR GOOGLE DIALOGFLOW //
// app.use("/gdf", dialogFlow);

app.use('/conversations', conversationRouter);
app.use('/integrations', integrationRouter);
app.use('/users', userRouter);
app.post('/auth', returnToken);
app.use('/zendesk', zendeskRouter);
app.use('/notifications', notififactionRouter);
app.use('/chatToken', chatToken);

app.get(['/', '/custom-app'], (req, res) => {
  const { origin, app_guid } = req.query;
  if (origin !== `https://${zdSubdomain}.zendesk.com` && app_guid !== zdAppGuid)
    return res
      .status(401)
      .send('Unauthorized - Page only visible within Zendesk Iframe app');
  if (req.path === '/custom-app') {
    app.use(express.static(path.join(__dirname, '../client/assets')));
    return res.sendFile(path.join(__dirname, '../client/assets/index.html'));
  }
  res.redirect('/custom-app');
});

// FOR EJS //

// app.get("/", (_, res) => {
//   res.render("index.ejs", {
//     sessionStorageKey: sessionStorageKey,
//     messagingWidgetKey: messagingWidgetKey,
//     suncoIntegrationId: suncoIntegrationId,
//   });
// });

// app.get("/integrationweb2", (_, res) => {
//   res.render("integrationweb2.ejs", { sessionStorageKey: sessionStorageKey });
// });

// app.use((_, res) => {
//   res.status(404).render("404.ejs");
// });

app.all('/webhooks', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(process.env.PORT ?? 3000, () =>
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`)
);
