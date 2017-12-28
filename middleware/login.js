const jwt = require('jsonwebtoken')
const Config = require('../config')

module.exports = async (req, res, next) => {
  res.locals.mid = await new Promise(resolve => {
    jwt.verify(req.headers.atoken, Config.jwtkey, (err, payload) => {
      if (err) {
        resolve(null)
      } else {
        resolve((payload || {}).id)
      }
    })
  })
  next()
}
