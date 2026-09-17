import type { Request, Response, NextFunction } from 'express';

const checkOrigin = (req: Request, res: Response, next: NextFunction) => {
    const { referer, host } = req.headers || {};
    const allowedOrigins = ['localhost:5173', 'localhost:3000', '127.0.0.1'];
    if (
        !allowedOrigins.some(
            (origin) =>
                typeof host === 'string' && typeof origin === 'string' && host.startsWith(origin)
        )
    ) {
        console.log(`Request received from ${host}`);
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

export default checkOrigin;
