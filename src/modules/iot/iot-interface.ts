import fetch from 'node-fetch';

export default class iotInterface {
    static async toggle(deviceName) {
        const response = await fetch(`${process.env.IOT_HOST}/action/${deviceName}/toggle`);
        return await response.json();
    }

    static async turnOn(deviceName) {
        const response = await fetch(`${process.env.IOT_HOST}/action/${deviceName}/turnOn`);
        return await response.json();
    }

    static async turnOff(deviceName) {
        const response = await fetch(`${process.env.IOT_HOST}/action/${deviceName}/turnOff`);
        return await response.json();
    }
}
