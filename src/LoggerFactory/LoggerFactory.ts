import {createLogger, format, transports} from 'winston';
import type winston from 'winston';
import TelegramBotTransport from './TelegramBotTransport';

export default class LoggerFactory {
    private readonly bot: any;
    private readonly adminId: any;
    private readonly createConsoleFormat: (loggerName) => any;

    constructor({bot, adminId}) {
        const {
            combine,
            timestamp,
            label,
            printf,
            errors,
            colorize,
            // json,
        } = format;

        this.bot = bot;
        this.adminId = adminId;

        this.createConsoleFormat = (loggerName?: string) => combine(
            colorize(),
            errors({stack: true}),
            timestamp({format: 'DD.MM.YY HH:mm:ss'}),
            printf(({
                level,
                message,
                timestamp,
                /**
                 * Кастомное опциональное поле фактического времени события
                 * Если приходит пустое, то будет показан 'timestamp'
                 */
                eventTimestamp,
                /**
                 * Кастомное опциональное поле названия сервиса
                 * Если приходит пустое, то не будет показано
                 */
                service,
                /**
                 * Кастомное опциональное поле названия модуля
                 * Если приходит пустое, то будет показан 'loggerName'
                 */
                label,
            }) => {
                const time = eventTimestamp ? `(${new Date(eventTimestamp).toLocaleDateString()} ${new Date(eventTimestamp).toLocaleTimeString()})` : timestamp;
                const messageService = service ? ` [${service}] >` : '';

                return `${time}${messageService} [${label ?? loggerName ?? '...'}] ${level}: ${message}`;
            }),
            label({
                label: loggerName ?? '',
            }),
        );
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
