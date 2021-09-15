import schedule from 'node-schedule'
import UserDeviceScan from './user-device-scan'
import Logger from '@modules/logger/logger'
import TuyaDevice from './tuya-device'
const logger = new Logger('iot-scheduler')

export default class IoTScheduler {
    constructor(USER_DEVICES, tyuaDevices: { clipLight: TuyaDevice, ambientLight: TuyaDevice }) {
        const nokiaSevenPlus = USER_DEVICES[0];
        const { clipLight, ambientLight } = tyuaDevices;

        schedule.scheduleJob('*/1 * * * *', lightOnByUserDevice);
        schedule.scheduleJob({ hour: 1, minute: 0 }, lightOffBySchedule);

        function lightOnByUserDevice() {
            const now = new Date().getHours();

            UserDeviceScan
                .scanDevice(nokiaSevenPlus)
                .then(isDeviceAvailable => {
                    // Если телефон найден
                    if (isDeviceAvailable) {
                        /* От 19:00 до 21:59 и если свет выключен */
                        if (now >= 18 && now <= 21 && ambientLight.status === false) {
                            // Включить свет
                            ambientLight.turnOn();
                            logger.log({
                                value: `⌛ Устройство «${ambientLight.name}» 🟡 включено по наличию телефона (от 18:00 до 21:59)`,
                                type: 'info'
                            });
                        }
                    }
                })
                .catch(error =>
                    logger.log({
                        value: `Произошла ошибка при выполнении lightOnByUserDevice. ${error}`,
                        type: 'error'
                    }));
        }

        function lightOffBySchedule() {
            clipLight.turnOff();
            ambientLight.turnOff();
            logger.log({
                value: `⌛ Устройства «${ambientLight.name}» ⚫ и «${clipLight.name}» выключены по расписанию (01:00)`,
                type: 'info'
            });
        }

    }
}