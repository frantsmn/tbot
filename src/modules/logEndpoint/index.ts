import type winston from 'winston';
import express from 'express';
import createRouter from './router';

export default function logEndpoint(loggerFactory) {
    const port = 3030;
    const app = express();
    const logger: winston.Logger = loggerFactory.createLogger('LogEndpoint');
    const router = createRouter(logger);

    app.listen(port, () => logger.info(`LogEndpoint started on port ${port}`));

    app.use(express.json());
    app.use(router);
}
