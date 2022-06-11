import express from 'express';
import createRouter from './router';

export default function logHub(loggerFactory) {
    const port = 3030;
    const app = express();
    const logger = loggerFactory.createLogger('LogHub');
    const router = createRouter(logger);

    app.listen(port, () => logger.info({
        message: `LogHub started on port ${port}`,
    }));

    app.use(express.json());
    app.use(router);
}
