// Middleware function to check if user is logged in or not
// if logged in, proceed 
// if not, redirect to the public homepage. 
// we can use the middleware to protect routes.
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { return next() } 
   return res.redirect('/login')
  //res.sendStatus(401)
}
 
module.exports = {isLoggedIn} 