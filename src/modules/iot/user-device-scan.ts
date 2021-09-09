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

        return new Promise((resolve, reject) => {

            logger.log({
                value: `Поиск устройства «${name}»...`,
                type: 'log'
            });

            arpScanner(onResult, { args: ['-l', '-v'] });

            function onResult(error, data) {
                if (error && error !== 1) {
                    logger.log({
                        value: `Ошибка при поиске устройства «${name}». ${error}`,
                        type: 'error'
                    });
                    reject(error);
                };

                // console.log(data)
                if (data !== null && data.some(device => device.mac === mac_wifi)) {
                    logger.log({
                        value: `Устройство «${name}» найдено!`,
                        type: 'info'
                    });
                    resolve(true);
                } else {
                    // console.log('[scan.js] Device not found');
                    resolve(false);
                }
            }

        });
    }

}