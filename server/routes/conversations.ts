import express from 'express';
import conversationEvents from '../controllers/conversationEvents.js';
import SunCoClient from '../utils/suncoApi.js';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
const router = express.Router();

const sunCo = new SunCoClient();

router.head('/', (_req, res) => {
    return res.sendStatus(200).end();
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

router.post('/attachment', async (req, res) => {
    try {
        const { conversationId } = req.body;
        const filePath = '/Users/rbonnefille/Downloads/pdf/dummy.pdf';
        const file = fs.createReadStream(filePath);
        const uploadResult = await sunCo.uploadAttachment(file, conversationId);
        if (!uploadResult?.attachment) {
            return res.status(502).json({ error: 'Attachment upload failed' });
        }
        return res.send(uploadResult.attachment);
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return res
            .status(502)
            .json({ error: 'Attachment service unavailable' });
    }
});

router.post('/form', async (req, res) => {
    try {
        console.log('Form response: ', req.body);

        const conversationId = req.body.conversationId;
        const messageId = req.body.messageId;
        const sdkPlatform = req.body.sdkPlatform;
        const sdkClientguid = req.body.sdkClientguid;
        const sdkIntegrationId = req.body.sdkIntegrationId;

        const fields = [
            {
                name: 'dataCapture.ticketField.26752975385105',
                label: 'Booking ID',
                type: 'text',
                text: '123456',
            },
            {
                name: 'dataCapture.ticketField.27187091485073',
                label: 'User plan',
                type: 'text',
                text: 'Pro plan',
            },
            {
                type: 'select',
                name: 'dataCapture.ticketField.25310167559313',
                label: 'Plan',
                select: [
                    {
                        name: '25310167558545',
                        label: 'Professional',
                    },
                ],
            },
        ];

        const participantsResponse =
            await sunCo.listParticipants(conversationId);
        console.log(participantsResponse);
        const user = participantsResponse?.participants[0];
        console.log('User:', user);
        if (!user) {
            console.error('No user in the conversation!');
            return res
                .status(404)
                .json({ error: 'Conversation user not found' });
        }

        const token = sign(
            {
                scope: 'user',
                external_id: user.userExternalId,
            },
            process.env.PASSWORD as string,
            { header: { alg: 'HS256', kid: process.env.USERNAME } }
        );

        console.log('JWT token: ' + token);

        const sessionId = uuidv4();

        try {
            await axios.post(
                `https://api.smooch.io/sdk/v2/apps/${process.env.APP_ID}/conversations/${conversationId}/messages`,
                {
                    author: {
                        role: 'appUser',
                        userId: user.userExternalId,
                        appUserId: user.userId,
                        sessionId: sessionId,
                        client: {
                            platform: sdkPlatform || 'web',
                            id: sdkClientguid,
                            integrationId: sdkIntegrationId,
                        },
                    },
                    message: {
                        type: 'formResponse',
                        role: 'appUser',
                        quotedMessageId: messageId,
                        fields: fields,
                    },
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'x-smooch-sdk':
                            sdkPlatform == 'ios' || sdkPlatform == 'android'
                                ? sdkPlatform + '/1.0.0'
                                : 'web/smooch/5.6.0',
                    },
                }
            );
        } catch (error) {
            console.error('Error sending form response:', (error as Error).message);
        }

        return res.end('{}');
    } catch (error) {
        console.error('Error handling form response:', error);
        return res.status(502).json({ error: 'Form service unavailable' });
    }
});

export default router;
