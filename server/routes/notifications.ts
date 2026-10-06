import express from 'express';
import axios from 'axios';

const {
    APP_ID: appId,
    SUNCO_TWILIO_INTEGRATION_ID: twilioIntegrationId,
    KEY_ID: keyId,
    KEY_SECRET: secretKey,
} = process.env;

const router = express.Router();

router.post('/sms', async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(404).send('No body found').end();
    }
    const { destinationId, message } = req.body;
    console.log(req.body);
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${keyId}:${secretKey}`).toString('base64')}`,
        },
    };

    const payload = {
        destination: {
            integrationId: twilioIntegrationId,
            destinationId: destinationId,
        },
        author: {
            role: 'appMaker',
        },
        message: {
            type: 'text',
            text: message,
        },
    };
    try {
        const response = await axios.post(
            `https://api.smooch.io/v1.1/apps/${appId}/notifications`,
            payload,
            config
        );
        const data = response.data;
        console.log(data);
        return res.json(data).end();
    } catch (error) {
        console.error(error);
        return res
            .json('Something went wrong - Check destinationId and message')
            .end();
    }
});

export default router;
