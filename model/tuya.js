const TuyAPI = require('tuyapi')

class TuyaDevice {
    #device = Object
    #isConnected = false
    #reconnectInterval = null
    #eventMap = {
        'statusChange': Function
    }

    constructor({ id, key, name }) {
        this.id = id
        this.name = name
        this.status = undefined
        this.#device = new TuyAPI({ id, key, version: 3.3 })

        this.#device.on('connected', () => {
            console.log(`[tuya.js] Device "${this.name}" connected!`);
            this.isConnected = true;
        });

        this.#device.on('disconnected', () => {
            console.log(`[tuya.js] Device "${this.name}" disconnected!`);
            this.isConnected = false;
        });

        this.#device.on('data', data => {
            if (!data.dps) return
            this.status = data.dps['1'];
            this.#eventMap.statusChange(this.status);
            console.log(`[tuya.js] Device "${this.name}" status:`, this.status);
        });

        this.#device.on('error', error => {
            console.error(`[tuya.js] Device "${this.name}" error:`, error);
        });

        this.connect();
    }

    async connect() {
        try {
            await this.#device.find();
            await this.#device.connect();
        } catch (error) {
            console.error(`Device "${this.name}" connect error:`, error);
        }
    }

    async toggle() {
        if (!this.isConnected) return;
        const data = await this.#device.set({ set: !this.status });
        if (data) this.status = data.dps['1'];
        return this.status;
    }

    on(eventName, callback) {
        this.#eventMap[eventName] = callback;
    }

    set isConnected(bool) {
        this.#isConnected = bool;

        if (bool === false) {
            console.log(`[tuya.js] Trying to reconnect "${this.name}" in 10 sec...`);

            this.#reconnectInterval = setInterval(() => {
                console.log(`[tuya.js] Reconnecting "${this.name}"...`);
                this.connect();
            }, 10000);
        } else {
            clearInterval(this.#reconnectInterval);
        }
    }

    get isConnected() {
        return this.#isConnected;
    }
}

const devices = TUYA_DEVICES.map(device => new TuyaDevice(device));
const clipLight = devices[0];
const ambientLight = devices[1];

exports.clipLight = clipLight;
exports.ambientLight = ambientLight;