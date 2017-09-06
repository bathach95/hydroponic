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
        { resources: '/user/delete', permissions: '*' }
      ]
    }, {
      roles: 'mod',
      allows: [
        { resources: '/mod', permissions: '*' }
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

module.exports = {
  getDateFromGMT: getDateFromGMT,
  setRole: setRole,
  getUserId: getUserId
}
