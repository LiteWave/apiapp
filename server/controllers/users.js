/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('underscore');

/**
 * Auth callback
 */
exports.authCallback = function (req, res, next)
{
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function (req, res)
{
  res.render('users/signin', {
    title: 'Signin',
    message: req.flash('error')
  });
};

/**
 * Show sign up form
 */
exports.signup = function (req, res)
{
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */
exports.signout = function (req, res)
{
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function (req, res)
{
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function (req, res)
{
  var user = new User(req.body);

  user.provider = 'local';
  user.save(function (err)
  {
    if (err)
    {
      return res.render('users/signup', {
        errors: err.errors,
        user: user
      });
    }
    req.logIn(user, function (err)
    {
      if (err) return next(err);
      return res.redirect('/');
    });
  });
};

/**
 * List of users
 */
exports.all = function (req, res)
{
  var q = {};

  // if the logged in user is an agent, then only return that agency's users
  if (req.user.userType == 'Agent')
  {
    q = { _agent: req.user._agent };
  }
  if (req.param('userType'))
  {
    q = _.extend(q, { userType: req.param('userType') });
  }

  User.find(q).sort('username').exec(function (err, users)
  {
    if (err)
    {
      res.render('error', {
        status: 404
      });
    } else
    {
      res.jsonp(users);
    }
  });
};

/**
 *  Show a user - not necessarily the logged in user
 */
exports.show = function (req, res)
{
  res.jsonp(req.profile);
};

/**
 * Update a user
 */
exports.update = function (req, res)
{
  var profile = req.profile;  // user is loading into profile when accessed by ID

  profile = _.extend(profile, req.body);

  profile.save(function (err)
  {
    res.jsonp(profile);
  });
};


/**
 * Send Logged in User
 */
exports.me = function (req, res)
{
  res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function (req, res, next, id)
{
  User
      .findOne({
        _id: id
      })
      .exec(function (err, user)
      {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.profile = user;
        next();
      });
};