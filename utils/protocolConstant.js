module.exports = {
    MQTT_BROKER: 'mqtt://13.58.114.56:1883',
    MQTT_OPTIONS: {
        qos: 2
    },
    ACK: {
        MSG_LENGTH: 19,
        CMD_ID : '07',
        DATA_LENGTH: '0001',
        HANDLED: '1',
        IGNORE: '0'
    },
    SENSOR_DATA: {
        MSG_LENGTH: 30,
        CMD_ID: '04',
        DATA_LENGTH: '0012'
    },
    TIME_OUT_DATA: 10,
    DEVICE_STATUS_NO_CONNECTION: "no connection",
    DEVICE_STATUS_RUNNING: "running",
    TIME_ZONE: "+07:00"
}