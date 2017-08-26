var express = require('express');
var router = express.Router();
var user = require('./user.js')

router.get("/", function(req, res){
  res.render("index");
});

// This gets the ID from currently logged in user
function get_user_id( req, res ) {
  
      // Since numbers are not supported by node_acl in this case, convert
      //  them to strings, so we can use IDs nonetheless.
      return req.user && req.user.id.toString() || false;
  }

router.get("/dashboard", [user.authenticate(), user.acl.middleware(1, get_user_id)], function(req, res){
  // console.log(req.user);
  // console.log(req.session);
  // console.log(req.url);
  // console.log(req.method);

  user.acl.allowedPermissions(req.user.id, ['/dashboard'], function(err, permissions){
    console.log(permissions)
})
  
  res.send('you are authorized to come here!');
});

router.post("/dashboard", [user.authenticate(), user.acl.middleware(1, get_user_id)], function(req, res){
  // console.log(req.user);
  // console.log(req.session);
  // console.log(req.url);
  // console.log(req.method);

  user.acl.allowedPermissions(req.user.id, ['/dashboard'], function(err, permissions){
    console.log(permissions)
})
  
  res.send('you are authorized to come here!');
});
module.exports = router;
