import TuyAPI from 'tuyapi'
import Logger from '@modules/logger/logger'
const logger = new Logger('tuya-device')


interface EventMap {
    statusChange: Function
}

export default class TuyaDevice {
    id: string
    name: string
    #device: any
    #isConnected: boolean
    #status: boolean
    #eventMap: EventMap

    constructor({ id, key, name }) {
        this.id = id
        this.name = name
        this.#device = new TuyAPI({ id, key, version: 3.3 })
        this.#eventMap = {
            statusChange: () => { }
        }

        this.#device.on('connected', () => {
            logger.log({
                value: `Устройство «${this.name}» подключено!`,
                type: 'info'
            });
            this.#isConnected = true;
        });

        this.#device.on('disconnected', () => {
            logger.log({
                value: `Устройство «${this.name}» отключено!`,
                type: 'info'
            });
            this.#isConnected = false;

            logger.log({
                value: `Переподключение к устройству «${this.name}» через 10 секунд...`,
                type: 'warn'
            });

            setTimeout(() => this.connect(), 10000);
        });

        this.#device.on('data', data => {
            if (!data.dps || this.#status === data.dps['1']) return;
            this.#status = data.dps['1'];
            this.#eventMap.statusChange(this.status);
        });

        this.#device.on('error', error => {
            logger.log({
                value: `Ошибка с устройством «${this.name}». ${error}`,
                type: 'error'
            });
        });

        this.connect();
    }

    async connect() {
        try {
            await this.#device.find();
            await this.#device.connect();
        } catch (error) {
            logger.log({
                value: `Ошибка подключения устройства «${this.name}». ${error}`,
                type: 'warn'
            });
        }
    }

    async toggle(): Promise<boolean | null> {
        if (!this.#isConnected) return null;
        const data = await this.#device.set({ set: !this.#status });
        if (data) this.#status = data.dps['1'];
        return this.#status;
    }

    async turnOn(): Promise<boolean | null> {
        if (!this.#isConnected) return null;
        const data = await this.#device.set({ set: true });
        if (data) this.#status = data.dps['1'];
        return this.#status;
    }

    async turnOff(): Promise<boolean | null> {
        if (!this.#isConnected) return null;
        const data = await this.#device.set({ set: false });
        if (data) this.#status = data.dps['1'];
        return this.#status;
    }

    on(eventName: 'statusChange', callback: Function) {
        this.#eventMap[eventName] = callback;
    }

    get status() {
        return this.#status;
    }

    get isConnected() {
        return this.#isConnected;
    }
}
