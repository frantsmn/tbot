import arpScanner from 'arpscan'
import Logger from '@modules/logger/logger'
const logger = new Logger('user-device-scan')

interface UserDevice {
    name: string
    mac_wifi: string
    mac_bluetooth: string
}

export default class UserDeviceScan {

    static scanDevice({ name, mac_wifi }: UserDevice): Promise<boolean | null> {

        if (process.platform !== "linux") return Promise.resolve(null);

        logger.log({
            value: `Поиск устройства «${name}»...`,
            type: 'log'
        });

        return new Promise((resolve, reject) => {

            arpScanner(onResult, { command: 'arp-scan', args: ['-l'], sudo: true });

            function onResult(error, data) {
                if (error) {
                    logger.log({
                        value: `Ошибка при поиске устройства «${name}». ${error}`,
                        type: 'error'
                    });
                    reject(error);
                }

                // console.log(data, '---', name, mac_wifi);
                if (data !== null && data.some(device => device.mac === mac_wifi)) {
                    logger.log({
                        value: `Устройство «${name}» найдено!`,
                        type: 'info'
                    });
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        })
    }
}