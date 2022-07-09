import type winston from 'winston';
import express from 'express';

export default function createRouter(logger: winston.Logger) {
    const router = express.Router();

    /**
     * Log endpoint
     */
    router.all('/log', (
        req,
        res,
    ) => {
        logger.log(req.body);
        res.json('ok');
    });

    /**
     * Logger status
     */
    router.all('/status', (
        req,
        res,
    ) => res.json('ok'));

    return router;
}
