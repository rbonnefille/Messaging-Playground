import express from 'express';
import zdEvents from '../controllers/zdEvents.js';
import { zdssoLogin, zdJwt } from '../controllers/zdSSO.js';
import { zdSDKJwt } from '../controllers/zdSDKJwt.js';
import { getTickets, searchUser } from '../utils/zendeskApi.js';
import { features } from '../config/features.js';

const router = express.Router();

router.head('/', (_req, res) => {
    return res.sendStatus(200).end();
});

if (features.zendeskSSOJwt) {
    router.get('/', (req, res) => {
        console.log(req.query);
        const { kind, return_to } = req.query;

        if (kind === 'info') {
            return res.redirect(302, `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/`);
        }

        const jwtUrl = new URL(`https://${process.env.NGROK_SUBDOMAIN}.ngrok.io/zendesk/jwt`);
        if (return_to) jwtUrl.searchParams.set('return_to', return_to as string);
        return res.redirect(302, jwtUrl.toString());
    });

    router.post('/sdk-jwt', zdSDKJwt);

    router.get('/jwt', zdJwt);
    router.get('/login', zdssoLogin);
    router.post('/login', zdssoLogin);
    router.get('/logout', (_req, res) => {
        res.redirect(`https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/`);
    });
} else {
    router.use((req, res) => {
        res.status(403).json({ error: 'Zendesk SSO JWT feature not enabled. Check .env in server' });
    });
}

router.post('/webhooks', zdEvents);

router.post('/webhooks/tickets', (req, res) => {
    console.log('Received ticket webhook:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200).end();
});

router.post('/webhooks/messaging', (req, res) => {
    console.log(
        'Received messaging webhook:',
        JSON.stringify(req.body, null, 2)
    );
    res.sendStatus(200).end();
});

if (features.zendeskApis) {
    router.get('/tickets/:id', async (req, res) => {
        const { id } = req.params;
        const tickets = await getTickets();
        console.log(`Received request for ticket with ID: ${id}`);
        res.send(tickets);
    });
    router.post('/users/search', async (req, res) => {
        const { externalId } = req.body;
        if (!externalId) {
            return res.status(400).json({ error: 'Missing externalId in request body' });
        }
        const user = await searchUser(externalId as string);
        if (!user || (user as { count?: number }).count === 0) {
            return res.status(404).json({ error: 'No users found with the given externalId' });
        }
        console.log(`Received request for user with external ID: ${externalId}`);
        res.send(user);
    });
}

export default router;
