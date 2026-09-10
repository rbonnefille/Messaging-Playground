import type { Request, Response } from 'express';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { v4 as uuidv4 } from 'uuid';

export const zdJwt = (_req: Request, _res: Response) => {};

export const zdssoLogin = (req: Request, res: Response) => {
    const shared_key = process.env.ZD_SSO_SECRET;
    const { name, email, role } = req.body;

    if (!name || !email) {
        res.send('No name or email query parameter found');
        return;
    }
    const payload = {
        iat: Math.floor(new Date().getTime() / 1000),
        jti: uuidv4(),
        name: name,
        email: email,
        role: role ?? 'end-user',
        external_id: email,
        phone: '+15551234567',
        tags: ['sso-jwt'],
    };
    if (req.get('x-forwarded-host')?.includes('romain-sunco.eu.ngrok.io')) {
        const jwtToken = sign(payload, shared_key as string, {
            algorithm: 'HS256',
        });
        const accessUrl = new URL(
            'https://z3nsuncoswitchboard.zendesk.com/access/jwt'
        );
        accessUrl.searchParams.set('jwt', jwtToken);
        return res.redirect(accessUrl.toString());
    }
    if (req.headers.referer?.includes('http://localhost')) {
        console.log(
            `Token SSO: ${sign(payload, shared_key as string, {
                algorithm: 'HS256',
            })}`
        );
        return res.json({
            token: `${sign(payload, shared_key as string, { algorithm: 'HS256' })}`,
        });
    } else res.send('Referer/forwarded not allowed');
};
