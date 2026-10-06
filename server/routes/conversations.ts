import express from 'express';
import conversationEvents from '../controllers/conversationEvents.js';
import SunCoClient from '../utils/suncoApi.js';

const router = express.Router();

const sunCo = new SunCoClient();

router.head('/', (_req, res) => {
    return res.sendStatus(200).end();
});

router.post('/create', async (req, res) => {
    try {
        const response = await sunCo.createConversation(req.body);
        return res.json(response);
    } catch (error) {
        console.error('Error creating conversation:', error);
        return res
            .status(502)
            .json({ error: 'Conversation service unavailable' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const conversation = await sunCo.getConversation(conversationId);
        if (!conversation?.conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        return res.json(conversation.conversation);
    } catch (error) {
        console.error('Error getting conversation:', error);
        return res
            .status(502)
            .json({ error: 'Conversation service unavailable' });
    }
});

router.get('/:id/messages', async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const conversationMessages = await sunCo.listMessages(conversationId);
        return res.json(conversationMessages);
    } catch (error) {
        console.error('Error listing conversation messages:', error);
        return res
            .status(502)
            .json({ error: 'Conversation service unavailable' });
    }
});

router.post('/', conversationEvents);

export default router;
