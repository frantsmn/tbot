import schedule from 'node-schedule'
import UserDeviceScan from './user-device-scan'
import Logger from '@modules/logger/logger'
const logger = new Logger('iot-scheduler')

export default class IoTScheduler {
    BOT: any
    constructor(USER_DEVICES, { clipLight, ambientLight }) {
        const nokiaSevenPlus = USER_DEVICES[0];

        schedule.scheduleJob('*/1 * * * *', lightScheduler);

        function lightScheduler() {
            const now = new Date().getHours()

            // 1. По наличию телефона
            UserDeviceScan
                .scanDevice(nokiaSevenPlus)
                .then(result => {

                    // Если телефон найден
                    if (result) {
                        /* От 19:00 до 22:00 и если свет выключен */
                        if (now >= 19 && now <= 22 && ambientLight.status === false) {
                            // Включить свет
                            ambientLight.toggle();
                            // TODO Прикрутить logger
                            console.log('[scheduler.js] Ambient lights turn on! (20:00 - 22:00) [phone at home + lights was off])');
                        }
                    }

                })
                // TODO Прикрутить logger
                .catch(error => console.log('[scheduler.js] checkDevice() error: ', error));


            // 2. По расписанию

            // TODO Сделать простое выключение света в определенное время
            /* От 01:00 до 05:00 если AMBIENT свет включен */
            if (now >= 1 && now <= 5 && ambientLight.status === true) {
                // выключить свет
                ambientLight.toggle();
                // TODO Прикрутить logger
                console.log('[scheduler.js] Ambient lights turn off! (01:00 - 05:00) [light was on])');
            }

            // TODO Сделать простое выключение света в определенное время
            /* От 01:00 до 05:00 если CLIPLIGHT свет включен */
            if (now >= 1 && now <= 5 && clipLight.status === true) {
                // выключить свет
                clipLight.toggle();
                // TODO Прикрутить logger
                console.log('[scheduler.js] Ambient lights turn off! (01:00 - 05:00) [light was on]');
            }

        }

    }
}