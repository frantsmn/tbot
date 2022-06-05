import express from 'express';
import type winston from 'winston';

export default function createRouter(logger: winston.Logger) {
    const router = express.Router();

    /**
     * Log endpoint
     */
    router.get('/log', async (
        req,
        res,
    ) => {
        await logger.log(req.body);
        res.json('ok');
    });

    /**
     * Logger status
     */
    router.all('/status', async (
        req,
        res,
    ) => res.json('ok'));

    return router;
}
