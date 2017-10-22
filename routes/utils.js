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

/* encrypt and decrypt by AES-OFB */

// An example 128-bit key 
var key = [18, 12, 3, 4, 15, 6, 7, 9, 17, 11, 2, 13, 14, 5, 16, 1];

// The initialization vector (must be 16 bytes) 
var iv = [33, 25, 26, 40, 28, 29, 30, 31, 32, 24, 35, 23, 37, 21, 39, 27];

function encrypt(dataString) {
  var textBytes = aesjs.utils.utf8.toBytes(dataString);

  var aesOfb = new aesjs.ModeOfOperation.ofb(key, iv);
  var encryptedBytes = aesOfb.encrypt(textBytes);

  // To print or store the binary data, you may convert it to hex 
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  return encryptedHex;
}

function decrypt(dataString) {

  // When ready to decrypt the hex string, convert it back to bytes 
  var encryptedBytes = aesjs.utils.hex.toBytes(dataString);

  // The output feedback mode of operation maintains internal state, 
  // so to decrypt a new instance must be instantiated. 
  var aesOfb = new aesjs.ModeOfOperation.ofb(key, iv);
  var decryptedBytes = aesOfb.decrypt(encryptedBytes);

  // Convert our bytes back into text 
  var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  return decryptedText;
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
