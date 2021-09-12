import TuyaDevice from "./tuya-device"
import IoTScheduler from "./iot-scheduler"
import IoTController from "./iot-controller"

export default class IoT {
    constructor(TUYA_DEVICES, USER_DEVICES, BOT, ADMIN_ID) {

        const devices: TuyaDevice[] = TUYA_DEVICES.map(device => new TuyaDevice(device));
        const clipLight: TuyaDevice = devices[0];
        const ambientLight: TuyaDevice = devices[1];

        new IoTScheduler(USER_DEVICES, { clipLight, ambientLight });
        new IoTController(BOT, ADMIN_ID, { clipLight, ambientLight });

    }
}