import IoTScheduler from "./iot-scheduler"
import iotController from "./iot-controller"

export default class IoT {
    constructor(IOT_HOST, IOT_DEVICES, USER_DEVICES, BOT, ADMIN_ID) {
        new iotController(BOT, ADMIN_ID);
        // TODO -> в сервис
        new IoTScheduler();
    }
}
