import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { v4 as uuidv4 } from 'uuid';

export const zdSDKJwt = (req, res) => {
    const { user_token } = req.body;
    const shared_key = process.env.ZD_SUPPORT_SDK_JWT_SECRET;
    const name = 'michael scott';
    const email = 'm-scott@example.com';
    const userIdentifier = 'm-scott';

    if (!user_token) {
        res.status(401).send('No user_token query parameter found');
        return;
    }
    if (!shared_key) {
        res.status(401).send('No shared_key environment variable found');
        return;
    }

    if (user_token !== userIdentifier) {
        res.status(401).send('Invalid user_token');
        return;
    }

    const payload = {
        iat: Math.floor(new Date().getTime() / 1000),
        jti: uuidv4(),
        name: name,
        email: email,
    };

    const jwt = sign(payload, shared_key, { algorithm: 'HS256' });

    return res.json({
        jwt: jwt,
    });
};
