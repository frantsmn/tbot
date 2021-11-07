import IoTScheduler from "./iot-scheduler"
import iotController from "./iot-controller"

export default class IoT {
    constructor(BOT, ADMIN_ID) {
        new iotController(BOT, ADMIN_ID);
        // TODO -> вынести в сервис
        new IoTScheduler();
    }
}
