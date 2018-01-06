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
    TIME_OUT_DATA: 10, // second
    TIME_OUT_REQUEST_MQTT: 5, // second
    DEVICE_STATUS_NO_CONNECTION: "no connection",
    DEVICE_STATUS_RUNNING: "running",
    TIME_ZONE: "Asia/Ho_Chi_Minh",
    PARSE_TIME_FORMAT: "MM/DD/YYYY HH:mm A",
    SEND_TIME_FORMAT: "YYYYMMDDHHmmss"
}