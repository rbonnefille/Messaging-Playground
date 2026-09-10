import express from 'express';
const router = express.Router();

router.post('/', (_req, res) => {
    res.sendStatus(200).end();
});

router.head('/', (_req, res) => {
    res.sendStatus(200).end();
});

export default router;
