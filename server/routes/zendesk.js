import express from 'express';
import zdEvents from '../controllers/zdEvents.js';
import { zdssoLogin, zdJwt } from '../controllers/zdSSO.js';
import { zdSDKJwt } from '../controllers/zdSDKJwt.js';

const router = express.Router();

router.head('/', (_, res) => {
    return res.sendStatus(200).end();
});

// Handles Zendesk logout callback and login-flow redirects from zdJwt
router.get('/', (req, res) => {
    console.log(req.query);
    const { kind, return_to } = req.query;

    // Logout callback from Zendesk (kind=info, message=You have been signed out.)
    if (kind === 'info') {
        return res.redirect(302, 'https://z3nsuncoswitchboard.zendesk.com/');
    }

    // Login flow: forward to SSO jwt endpoint so Zendesk initiates auth
    const jwtUrl = new URL('https://romain-sunco.eu.ngrok.io/zendesk/jwt');
    if (return_to) jwtUrl.searchParams.set('return_to', return_to);
    return res.redirect(302, jwtUrl.toString());
});

router.post('/sdk-jwt', zdSDKJwt);

router.post('/webhooks', zdEvents);

router.post('/webhooks/tickets', (req, res) => {
    // feature https://developer.zendesk.com/api-reference/webhooks/event-types/ticket-events/
    console.log(`Received ticket webhook: ${req.body}`);
    res.sendStatus(200).end();
});

router.post('/webhooks/messaging', (req, res) => {
    // feature https://developer.zendesk.com/api-reference/webhooks/event-types/messaging-events/
    console.log(`Received messaging webhook: ${req.body}`);
    res.sendStatus(200).end();
});

// Zendesk SSO Routes
router.get('/jwt', zdJwt);
router.get('/login', zdssoLogin);
router.post('/login', zdssoLogin);
router.get('/logout', (_, res) => {
    res.redirect('https://z3nsuncoswitchboard.zendesk.com/');
});

export default router;
