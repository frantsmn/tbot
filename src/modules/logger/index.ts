import express from 'express';
import createRouter from './router';

export default class LogHub {
    constructor(logger) {
        const port = 990;
        const app = express();
        const router = createRouter(logger);

        app.listen(port, () => logger.info({
            message: `LogHub started on port ${port}`,
        }));

        app.use(express.json());
        app.use(router);
    }
}
