import express from 'express';
const router = express.Router();
import SunCoClient, { isApiSuccess } from '../utils/suncoApi.js';
import checkOrigin from '../middleware/validateOrigin.js';

router.use(checkOrigin);

router.post('/listUser', async (req, res) => {
    try {
        const userEmail = req.body;
        const sunCo = new SunCoClient();
        const user = await sunCo.getUserByEmailIdentity(userEmail);
        if (
            isApiSuccess(user) &&
            Object.prototype.hasOwnProperty.call(user, 'users') &&
            user.users.length > 0
        ) {
            return res.json(user.users[0]);
        }
        return res.status(404).json({ error: 'User not found' });
    } catch (error) {
        console.error('Error finding user by email:', error);
        return res.status(502).json({ error: 'User service unavailable' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const sunCo = new SunCoClient();
        const user = await sunCo.getUser(userId);
        if (
            isApiSuccess(user) &&
            Object.prototype.hasOwnProperty.call(user, 'user')
        ) {
            return res.json(user);
        }
        return res.status(404).json({ error: 'User not found' });
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(502).json({ error: 'User service unavailable' });
    }
});

router.get('/:id/conversations', async (req, res) => {
    try {
        const { id: userId } = req.params;
        const sunCo = new SunCoClient();
        const conversations = await sunCo.listConversations(userId);
        if (
            isApiSuccess(conversations) &&
            Object.prototype.hasOwnProperty.call(conversations, 'conversations')
        ) {
            return res.json(conversations);
        }
        return res.status(404).json({ error: 'Conversations not found' });
    } catch (error) {
        console.error('Error listing conversations:', error);
        return res
            .status(502)
            .json({ error: 'Conversation service unavailable' });
    }
});

router.delete('/:id/conversations', async (req, res) => {
    try {
        const { id: userId } = req.params;
        const sunCo = new SunCoClient();
        const allConversations = await sunCo.listConversations(userId);
        if (!isApiSuccess(allConversations) || !allConversations.conversations) {
            return res.status(404).json({ error: 'Conversations not found' });
        }

        const conversationsToDelete = allConversations.conversations.filter(
            (convo) =>
                convo.activeSwitchboardIntegration?.name !==
                'zd-agentWorkspace' && !convo.isDefault
        );

        await Promise.all(
            conversationsToDelete.map((convo) =>
                sunCo.deleteConversation(convo.id)
            )
        );

        return res.json({
            deletedConversations: conversationsToDelete.length,
        });
    } catch (error) {
        console.error('Error deleting conversations:', error);
        return res
            .status(502)
            .json({ error: 'Conversation service unavailable' });
    }
});

router.get('/:id/clients', async (req, res) => {
    try {
        const { id: userId } = req.params;
        const sunCo = new SunCoClient();
        const clientsList = await sunCo.listClients(userId);
        if (
            isApiSuccess(clientsList) &&
            Object.prototype.hasOwnProperty.call(clientsList, 'clients')
        ) {
            return res.json(clientsList);
        }
        return res.status(404).json({ error: 'Clients not found' });
    } catch (error) {
        console.error('Error listing clients:', error);
        return res.status(502).json({ error: 'Client service unavailable' });
    }
});

router.get('/:id/devices', async (req, res) => {
    try {
        const { id: userId } = req.params;
        const sunCo = new SunCoClient();
        const devicesList = await sunCo.listDevices(userId);
        if (
            isApiSuccess(devicesList) &&
            Object.prototype.hasOwnProperty.call(devicesList, 'devices')
        ) {
            return res.json(devicesList);
        }
        return res.status(404).json({ error: 'Devices not found' });
    } catch (error) {
        console.error('Error listing devices:', error);
        return res.status(502).json({ error: 'Device service unavailable' });
    }
});

export default router;
