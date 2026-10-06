import express from 'express';
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

router.use('/conversations', conversationRouter);
router.use('/switchboards', switchboardsRouter);
router.use('/integrations', integrationRouter);
router.use('/users', userRouter);
router.post('/auth', returnToken);
router.use('/zendesk', zendeskRouter);
router.use('/notifications', notificationRouter);
router.use('/chatToken', chatTokenRouter);
router.use('/webhooks', webhooksRouter);

export default router;
