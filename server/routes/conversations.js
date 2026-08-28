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

router.head('/', (_, res) => {
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
    // const attachmentUrl =
    //   'https://media.smooch.io/apps/6062e4fb75a38000d2988959/5xCLAUEWlxN1rjGjyHUD8rbd/dummy.pdf';
});

// TEST FOR FREE NOW - SEND SDK MESSAGE FOR FORM MESSAGES //
router.post('/form', async (req, res) => {
    try {
        // Get user in the conversation
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

        // const fields = [
        //   {
        //     type: 'email',
        //     name: 'email',
        //     label: 'Email',
        //     email: 'test@test.com',
        //   },
        //   {
        //     type: 'text',
        //     name: 'company-website',
        //     label: 'Company website',
        //     text: 'Teet',
        //   },
        //   {
        //     type: 'select',
        //     name: 'company-size',
        //     label: 'Company size',
        //     select: [
        //       {
        //         name: '11-50',
        //         label: '11-50 employees',
        //       },
        //     ],
        //   },
        // ];
        const participantsResponse =
            await sunCo.listParticipants(conversationId);
        console.log(participantsResponse);
        const user = participantsResponse?.participants[0];
        console.log('User:', user);
        if (!user) {
            console.error('No user in the conversation!'); // Should never happen at this point
            return res
                .status(404)
                .json({ error: 'Conversation user not found' });
        }

        // Create JWT to login into the SDK endpoint
        //
        const token = sign(
            {
                scope: 'user',
                external_id: user.userExternalId,
            },
            process.env.PASSWORD,
            { header: { kid: process.env.USERNAME } }
        );

        console.log('JWT token: ' + token);

        const sessionId = uuidv4();

        // Send message through the SDK endpoint.
        // At this moment a hard-coded integration ID/client ID is used. The integration ID can be extracted through the message source. Right now the web integration ID is used.
        // The client ID can be found in the data returned by the list recipient API call
        //
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
                            id: sdkClientguid, // Client ID
                            integrationId: sdkIntegrationId, // Integration ID
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
                        Authorization: 'Bearer ' + token, // JWT token
                        'x-smooch-sdk':
                            sdkPlatform == 'ios' || sdkPlatform == 'android'
                                ? sdkPlatform + '/1.0.0'
                                : 'web/smooch/5.6.0', // SDK header to indicate what SDK is using. Is required to be able to use this endpoint
                    },
                }
            );
        } catch (error) {
            console.error('Error sending form response:', error.message);
        }

        // Send form response message as current user (through the SDK endpoint)
        //
        return res.end('{}');
    } catch (error) {
        console.error('Error handling form response:', error);
        return res.status(502).json({ error: 'Form service unavailable' });
    }
});

export default router;
