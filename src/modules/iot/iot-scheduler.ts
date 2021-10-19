import schedule from 'node-schedule'
import UserDeviceScan from './user-device-scan'
import Logger from '@modules/logger/logger'
import TuyaDevice from './tuya-device'

const logger = new Logger('iot-scheduler')

export default class IoTScheduler {
    constructor(USER_DEVICES, tyuaDevices: { clipLight: TuyaDevice, ambientLight: TuyaDevice }) {
        const nokiaSevenPlus = USER_DEVICES[0];
        const {clipLight, ambientLight} = tyuaDevices;

        // Пытаться включить свет...

        // каждую минуту от 17:00 до 21:59
        schedule.scheduleJob('*/1 17-21 * * *', ambientLightOnByUserDevice);
        // каждую минуту от 07:50 до 07:59 c понедельника по пятницу
        schedule.scheduleJob('55-59/1 7 * * 1-5', ambientLightOnByUserDevice);
        // каждую минуту от 08:00 до 08:05 c понедельника по пятницу
        schedule.scheduleJob('0-5/1 8 * * 1-5', ambientLightOnByUserDevice);

        // Выключать свет
        schedule.scheduleJob({hour: 1, minute: 0}, allLightsOff);
        schedule.scheduleJob({hour: 9, minute: 0}, allLightsOff);

        // Включение AmbientLight если найден телефон
        function ambientLightOnByUserDevice() {
            UserDeviceScan
                .scanDevice(nokiaSevenPlus)
                .then(isDeviceAvailable => {
                    if (!isDeviceAvailable || ambientLight.status) return;
                    ambientLight.turnOn().then(() =>
                        logger.log({
                            value: `⌛ Устройство «${ambientLight.name}» 🟡 включено по наличию телефона по расписанию`,
                            type: 'info'
                        })
                    );
                })
                .catch(error =>
                    logger.log({
                        value: `Произошла ошибка при выполнении lightOnByUserDevice. ${error}`,
                        type: 'error'
                    }));
        }

        // Выключение всего освещения
        function allLightsOff() {
            Promise.all([
                clipLight.turnOff(),
                ambientLight.turnOff()
            ]).then(() => {
                logger.log({
                    value: `⌛ Устройства «${ambientLight.name}» и «${clipLight.name}» выключены по расписанию`,
                    type: 'info'
                });
            }).catch((error) => {
                logger.log({
                    value: `⌛ Ошибка при выключении устройств «${ambientLight.name}» и «${clipLight.name}» по расписанию. ${error}`,
                    type: 'error'
                });
            })
        }

    }
}
