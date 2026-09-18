import type { Request, Response } from 'express';

const zdEvents = async (req: Request, res: Response) => {
    console.log(req.body);
    return res.sendStatus(200).end();
};

export default zdEvents;
