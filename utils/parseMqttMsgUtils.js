var protocolConstant = require('./protocolConstant');

/**
 * get header (mac, cmdId and dataLength) from message
 * @param {*} message : incoming message
 */
function getHeader(message) {
    return {
        mac: message.substr(0, 12),
        cmdId: message.substr(12, 2),
        dataLength: message.substr(14, 4)
    }
}

/**
 * parse ACK message
 * @param {*} message : incoming message string, ex: 0A1A2A3B4F5D0700011
 */
function parseAckMsg(message) {
    if (message.length === protocolConstant.ACK.MSG_LENGTH) {
        var header = getHeader(message);

        if (header.cmdId === protocolConstant.ACK.CMD_ID
            && header.dataLength === protocolConstant.ACK.DATA_LENGTH) {
            return {
                mac: header.mac,
                data: message.substr(18, 1)
            }
        } else {
            return null;
        }

    } else {
        return null;
    }
}

/**
 * parse sensor data from device
 * @param {*} message : incoming data from device
 */
function parseReceivedData(message) {
    if (message.length === protocolConstant.SENSOR_DATA.MSG_LENGTH) {
        var header = getHeader(message);
      if (header.cmdId === protocolConstant.SENSOR_DATA.CMD_ID 
        && header.dataLength === protocolConstant.SENSOR_DATA.DATA_LENGTH) {
        var data = message.substr(18, 12);
        return {
          mac: header.mac,
          temp: Number(data.substr(0, 2)),
          humidity: Number(data.substr(2, 2)),
          light: Number(data.substr(4, 4)),
          ppm: Number(data.substr(8, 4))
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
module.exports = {
    parseAckMsg: parseAckMsg,
    parseReceivedData: parseReceivedData
}