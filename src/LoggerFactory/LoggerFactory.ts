import {createLogger, format, transports} from 'winston';
import type winston from 'winston';
import TelegramBotTransport from './TelegramBotTransport';

export default class LoggerFactory {
    private readonly bot: any;
    private readonly adminId: any;
    private readonly createConsoleFormat: (loggerName) => any;

    constructor({bot, adminId}) {
        this.bot = bot;
        this.adminId = adminId;

        const {
            combine,
            timestamp,
            label,
            printf,
            errors,
            colorize,
            // json,
        } = format;
        const timeFormat = timestamp({format: 'DD.MM.YY HH:mm:ss'});
        const logFormat = printf(({
            level,
            message,
            label,
            timestamp,
        }) => `${timestamp} [${label}] ${level}: ${message}`);

        this.createConsoleFormat = (loggerName?: string) => {
            let params = [
                colorize(),
                errors({stack: true}),
                timeFormat,
                logFormat,
            ];

            if (loggerName) {
                params = [...params, label({label: loggerName})];
            }

            return combine(...params);
        };
    }

    createLogger(loggerName?: string): winston.Logger {
        return createLogger({
            level: 'silly',
            transports: [
                new transports.Console({
                    format: this.createConsoleFormat(loggerName),
                }),
                new TelegramBotTransport({
                    loggerName,
                    bot: this.bot,
                    adminId: this.adminId,
                }),
            ],
        });
    }
}
