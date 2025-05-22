import express from 'express';
import zdEvents from '../controllers/zdEvents.js';
import { zdssoLogin, zdJwt } from '../controllers/zdSSO.js';
import { zdSDKJwt } from '../controllers/zdSDKJwt.js';

const router = express.Router();

router.head('/', (_, res) => {
    return res.sendStatus(200).end();
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
    res.redirect('https://z3nsuncoswitchboard.zendesk.com/agent');
});

router.get('/orders/:id', (req, res) => {
    const { id: orderId } = req.params;
    res.send({
        orderId,
        status: 'unfulfilled',
        eligibleForReturn: true,
        cancellable: true,
    });
});
router.patch('/orders/:id', (req, res) => {
    const { id: orderId } = req.params;
    const { cancel } = req.body;
    if (!cancel) {
        return res.status(400).send({ error: 'Invalid request' });
    }
    res.send({
        orderId,
        status: 'unfulfilled',
        eligibleForReturn: true,
        cancellable: true,
        cancelled: true,
        refundCost: '100$',
    });
});

export default router;
