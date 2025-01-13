// routes/index.js
import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
// import * as dialogFlow from './dialogFlow.js';
import conversationRouter from './conversations.js';
import switchboardsRouter from './switchboards.js';
import integrationRouter from './integrations.js';
import webhooksRouter from './webhooks.js';
import userRouter from './users.js';
import zendeskRouter from './zendesk.js';
import notificationRouter from './notifications.js';
import chatTokenRouter from './chat.js';
import returnToken from '../utils/auth.js';

const router = express.Router();

const {
  BROWSER_SESSION_STORAGE_KEY: sessionStorageKey,
  MESSAGING_WIDGET_KEY: messagingWidgetKey,
  SUNCO_INTEGRATION_ID: suncoIntegrationId,
  ZD_SUBDOMAIN: zdSubdomain,
  ZD_APP_GUID: zdAppGuid,
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use('/conversations', conversationRouter);
router.use('/switchboards', switchboardsRouter);
router.use('/integrations', integrationRouter);
router.use('/users', userRouter);
router.post('/auth', returnToken);
router.use('/zendesk', zendeskRouter);
router.use('/notifications', notificationRouter);
router.use('/chatToken', chatTokenRouter);
// router.use('/gdf', dialogFlow);
router.use('/webhooks', webhooksRouter);

router.get(['/', '/custom-app'], (req, res) => {
  const { origin, app_guid } = req.query;
  if (
    origin !== `https://${process.env.ZD_SUBDOMAIN}.zendesk.com` &&
    app_guid !== process.env.ZD_APP_GUID
  ) {
    return res
      .status(401)
      .send('Unauthorized - Page only visible within Zendesk Iframe app');
  }
  if (req.path === '/custom-app') {
    app.use(express.static(path.join(__dirname, '../client/assets')));
    return res.sendFile(path.join(__dirname, '../client/assets/index.html'));
  }
  res.redirect('/custom-app');
});

export default router;
