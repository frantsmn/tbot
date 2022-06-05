import Transport from 'winston-transport';

export default class TelegramBotTransport extends Transport {
    bot: any;
    adminId: string;
    loggerName: string;

    constructor(opts) {
        super(opts);

        this.loggerName = opts.loggerName ?? '';
        this.bot = opts.bot;
        this.adminId = opts.adminId;
    }

    async log(info, callback) {
        const {
            timestamp = '',
            service = '',
            label = this.loggerName,
            level = '',
            message = '',
            isTg = false,
            isTgSilent = true,
        } = info;

        if (!isTg && level !== 'error') {
            callback();

            return;
        }

        const levelIconMap = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '🔥',
        };
        const disableNotification = isTgSilent && level !== 'error';
        const messageTimestamp = timestamp ? `${new Date(timestamp).toLocaleTimeString()}\n` : '';
        const messageService = service ? `[${service}]` : '';
        const messageLabel = label ? `[${label}]\n` : '';
        const messageLevel = levelIconMap[level] ? `${levelIconMap[level]} ` : `(${level}) `;
        const botMessage = `${messageLevel}${messageTimestamp}${messageService}${messageLabel}${message}`;

        await this.bot.sendMessage(this.adminId, botMessage, {
            disable_notification: disableNotification,
            parse_mode: 'Markdown',
        });

        callback();
    }
}
