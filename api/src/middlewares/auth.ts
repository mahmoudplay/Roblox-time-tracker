import { NextFunction, Request, Response } from "express";

export default function authReq(req: Request, res: Response, next: NextFunction) {
    if(!req.headers['authorization']) res.status(404).send('Not Found')

    if (req.headers['authorization'] === process.env.AUTH) {
        next();
    } else {
        res.status(404).send('Not Found')
    }
}