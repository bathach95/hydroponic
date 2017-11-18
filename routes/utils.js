var aesjs = require('aes-js');

function getDateFromGMT(dateTime) {
  // dateTime format: '2017-08-24T17:00:00.000Z'
  var date = dateTime.toString().split('T')[0].split('-');
  return {
    year: date[0],
    month: date[1],
    date: date[2]
  }

}

// This gets the ID from currently logged in user
function getUserId(req, res) {

  // Since numbers are not supported by node_acl in this case, convert
  //  them to strings, so we can use IDs nonetheless.
  return req.user && req.user.id.toString() || false;
}

function setRole(acl) {

  // Define roles, resources and permissions
  acl.allow([
    {
      roles: 'admin',
      allows: [
        { resources: '/admin', permissions: '*' },
        { resources: '/user/all', permissions: '*' },
        { resources: '/user/delete', permissions: '*' },
        { resources: '/user/detail', permissions: '*' },
        { resources: '/user/updaterole', permissions: '*' },
      ]
    }, {
      roles: 'mod',
      allows: [
        { resources: '/mod', permissions: '*' },
        { resources: '/article/delete', permissions: '*' },
        { resources: '/article/check', permissions: '*' },
        { resources: '/comment/delete', permissions: '*' }
      ]
    }, {
      roles: 'member',
      allows: []
    }
  ]);

  // Inherit roles
  //  Every mod is allowed to do what member do
  //  Every admin is allowed to do what mod do
  acl.addRoleParents('mod', 'member');
  acl.addRoleParents('admin', 'mod');
}

/* encrypt and decrypt by XXTEA*/

var key = "bkhydroponic@2017";

// return a buffer of Uint8Array data to send to device
function encrypt(dataString) {
  return Buffer.from(xxtea.encrypt(xxtea.toBytes(dataString), xxtea.toBytes(key)));
}

// get Uint8Array data, decrypt and convert to string
function decrypt(inputData) {
  var uint8Data = new Uint8Array(inputData);
  return xxtea.toString(xxtea.decrypt(uint8Data, xxtea.toBytes(key)));
}


function getDataStatus(data, threshold) {

  var status = {
    badStatus: {
      temp: data.temperature < threshold.temperatureLower || data.temperature > threshold.temperatureUpper,
      humidity: data.humidity < threshold.humidityLower || data.humidity > threshold.humidityUpper,
      ppm: data.ppm < threshold.ppmLower || data.ppm > threshold.ppmUpper,
      ph: data.ph < threshold.phLower || data.ph > threshold.phUpper
    }
  }

  status.status = status.badStatus.temp || status.badStatus.humidity || status.badStatus.ppm || status.badStatus.ph;
  return status;
}

module.exports = {
  getDateFromGMT: getDateFromGMT,
  getDataStatus: getDataStatus,
  setRole: setRole,
  getUserId: getUserId,
  encrypt: encrypt,
  decrypt: decrypt
}
