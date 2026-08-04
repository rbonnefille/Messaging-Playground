import Jwt from '../models/Jwt.js';
import { syncUser } from './zdApi.js';

const {
    AUTHORISED_ORIGIN: authorisedOrigin,
    AUTHORISED_ORIGIN_HC: authorisedOriginHc,
} = process.env;

const allowedOrigins = [
    'localhost:5173',
    'localhost:3000',
    '127.0.0.1',
    authorisedOrigin,
    authorisedOriginHc,
];

const returnToken = async (req, res) => {
    const { referer, host } = req.headers || {};
    if (!allowedOrigins.some((origin) => host.startsWith(origin))) {
        console.log(`Request received from ${host}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).send('Bad Request - Body needs to be provided');
        return;
    }
    const { external_id, name, email, emailVerified, shouldExpire } = req.body;
    console.log(req.body);
    const jwt = new Jwt(external_id, name, email, emailVerified, shouldExpire);
    const jwtToken = jwt.signJwt();
    const parts = jwtToken.split('.');
    console.log(
        `----------------------------------------Encoded JWT---------------------------------------- \n`
    );
    console.log(`JWT Token generated: ${jwtToken}`);
    console.log(
        `----------------------------------------Decoded JWT---------------------------------------- \n`
    );
    console.log(JSON.parse(`${Buffer.from(parts[1], 'base64').toString()} \n`));
    // await syncUser(email, external_id, name);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.json({ token: jwtToken });
};

export default returnToken;
