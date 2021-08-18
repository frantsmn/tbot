import colorLog from 'node-color-log'

//#region types

type LogType = 'log' | 'info' | 'warn' | 'error'

interface LocalDateTime {
    date: string
    time: string
    timestamp: number
}

interface LogOptions {
    type?: LogType
    value: string
    isAlertAdmin?: boolean
    // isSaveToStore?: boolean
}

interface LogObject extends LogOptions {
    tag: string
    localDateTime: LocalDateTime
}

//#endregion

export default class Logger {
    tag: string;
    constructor(tag: string) {
        this.tag = tag;
    }

    private getLocalDateTime(): LocalDateTime {
        const rawDate = new Date()
        return {
            date: rawDate.toLocaleDateString('ru'),
            time: rawDate.toLocaleTimeString('ru'),
            timestamp: Date.now()
        }
    }

    log(options: LogOptions): void {
        const logObject: LogObject = {
            type: options.type || 'log',
            value: options.value,
            // isSaveToStore: options.isSaveToStore || false,
            isAlertAdmin: options.type === 'error' || !!options.isAlertAdmin,
            tag: this.tag,
            localDateTime: this.getLocalDateTime(),
        }
        this.logToConsole(logObject)
        this.logToStore(logObject)
    }

    private logToConsole(logObject: LogObject): void {
        const message = `[${logObject.tag}] > ${logObject.localDateTime.time} | ${logObject.value}`
        const typeMap = {
            'log': () => colorLog.color('white').log(message),
            'info': () => colorLog.color('blue').log(message),
            'warn': () => colorLog.color('yellow').log(message),
            'error': () => colorLog.color('red').log(message),
        }
        typeMap[logObject.type || 'log']()
    }

    private logToStore(logObject: LogObject): void {
        // console.log('[logger] > TODO: Log to store', logObject);
    }
}