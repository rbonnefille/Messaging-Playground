import * as dotenv from 'dotenv';
dotenv.config();
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();

const { CHAT_SHARED_SECRET: chatSharedSecret } = process.env;

router.get('/', async (_req, res) => {
    const payload = {
        name: 'Romain Chat',
        email: 'romdb+zendeskchat2@protonmail.com',
        external_id: uuidv4(),
    };
    console.log(payload);
    const jwt = sign(payload, chatSharedSecret as string);
    console.log(jwt);
    res.json({ token: jwt });
});

export default router;
