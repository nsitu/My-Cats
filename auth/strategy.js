const User = require('../models/User')
// Authentication middleware: https://www.npmjs.com/package/passport
const passport = require('passport')  
// Authenticate with GitHub using OAuth2.0 
const PassportLocalStrategy = require('passport-local').Strategy 
// Passport's "Local" Strategy 
// means we will use our own Database instead of a Third party Provider
// http://www.passportjs.org/packages/passport-local/
const LocalStrategy = new PassportLocalStrategy(
  function(username, password, done) { 
    console.log(`${username} is trying to login.`)
    User.findOne({ username: username }, function (err, user) {
      if (err) return done(err)
      if (!user) return done(null, false)
      if (!user.verifyPassword(password)) return done(null, false)
      console.log(`${username} logged in successfully`)
      return done(null, user)
    })
  }
) 

module.exports = LocalStrategy 