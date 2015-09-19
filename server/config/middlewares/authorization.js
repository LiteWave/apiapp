/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

//  use to make sure only an admin can view
exports.requiresAdminLogin = function(req, res, next) {
  if (!req.isAuthenticated() || req.user.userType != 'admin')
  {
    return res.send(401, 'User is not authorized');
  }
  next();
}

