import colorLog from 'node-color-log';

// #region types

type LogType = 'log' | 'info' | 'warn' | 'error';

interface LocalDateTime {
    date: string;
    time: string;
    timestamp: number;
}

interface LogOptions {
    type?: LogType;
    value: string | number | unknown;
    isAlertAdmin?: boolean;
    // isSaveToStore?: boolean
}

interface LogObject extends LogOptions {
    tag: string;
    localDateTime: LocalDateTime;
}

// #endregion

export default class Logger {
    tag: string;
    BOT: any | null;
    ADMIN_ID: number | null;

    constructor(tag: string, BOT?: any, ADMIN_ID?: number) {
        this.tag = tag;
        this.BOT = BOT || null;
        this.ADMIN_ID = ADMIN_ID || null;
    }

    log(options: LogOptions): void {
        const logObject: LogObject = {
            type: options.type || 'log',
            value: options.value,
            // isSaveToStore: options.isSaveToStore || false,
            isAlertAdmin: options.type === 'error' || !!options.isAlertAdmin,
            tag: this.tag,
            localDateTime: this.getLocalDateTime(),
        };
        this.logToConsole(logObject);

        if (!this.BOT && !this.ADMIN_ID) {
            return;
        }

        this.logToAdmin(logObject);
    }

    getLocalDateTime(): LocalDateTime {
        const rawDate = new Date();

        return {
            date: rawDate.toLocaleDateString('ru'),
            time: rawDate.toLocaleTimeString('ru'),
            timestamp: Date.now(),
        };
    }

    logToConsole(logObject: LogObject): void {
        const message = `[${logObject.tag}] > ${logObject.localDateTime.time} | ${logObject.value}`;
        const typeMap = {
            log: () => colorLog.color('white').log(message),
            info: () => colorLog.color('blue').log(message),
            warn: () => colorLog.color('yellow').log(message),
            error: () => colorLog.color('red').log(message),
        };
        typeMap[logObject.type || 'log']();
    }

    private async logToAdmin(logObject: LogObject): Promise<void> {
        const {
            type, tag, isAlertAdmin, value,
        } = logObject;
        if (isAlertAdmin) {
            await this.BOT.sendMessage(this.ADMIN_ID, `‼ [${type}] [${tag}] ${value}`);
        }
    }
}
