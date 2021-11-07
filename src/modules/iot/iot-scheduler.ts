import schedule from 'node-schedule'
import Logger from '../../modules/logger/logger'
import iotInterface from './iot-interface';

const logger = new Logger('iot-scheduler')

export default class IoTScheduler {
    constructor() {
        // Пытаться включить свет каждую минуту от 17:00 до 21:59
        // TODO (если тел дома)
        // schedule.scheduleJob('*/1 17-21 * * *', ambientLightOnByUserDevice);

        // Пытаться включить свет
        // каждую минуту от 07:50 до 07:59 c понедельника по пятницу
        // TODO (если тел дома)
        schedule.scheduleJob('55-59/1 7 * * 1-5', ambientLightOn/*ambientLightOnByUserDevice*/);

        // Пытаться включить свет
        // каждую минуту от 08:00 до 08:05 c понедельника по пятницу
        // TODO (если тел дома)
        schedule.scheduleJob('0-5/1 8 * * 1-5', ambientLightOn/*ambientLightOnByUserDevice*/);

        // Выключать свет
        schedule.scheduleJob({hour: 1, minute: 0}, allLightsOff);
        schedule.scheduleJob({hour: 9, minute: 0}, allLightsOff);

        // Включение подсветки
        async function ambientLightOn() {
            await iotInterface.turnOn('ambient');
        }

        // Выключение всего освещения
        function allLightsOff() {
            Promise.all([
                iotInterface.turnOff('ambient'),
                iotInterface.turnOff('clip'),
            ]).then(() => {
                logger.log({
                    value: `⌛ Все устройства выключены по расписанию`,
                    type: 'info'
                });
            }).catch((error) => {
                logger.log({
                    value: `⌛ Ошибка при выключении всех устройств по расписанию. ${error}`,
                    type: 'error'
                });
            })
        }

    }
}
