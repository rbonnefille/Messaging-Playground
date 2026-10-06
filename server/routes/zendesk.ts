import express from 'express';
import zdEvents from '../controllers/zdEvents.js';
import { zdssoLogin, zdJwt } from '../controllers/zdSSO.js';
import { zdSDKJwt } from '../controllers/zdSDKJwt.js';

const router = express.Router();

router.head('/', (_req, res) => {
    return res.sendStatus(200).end();
});

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

router.get('/jwt', zdJwt);
router.get('/login', zdssoLogin);
router.post('/login', zdssoLogin);
router.get('/logout', (_req, res) => {
    res.redirect(`https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/`);
});

export default router;
