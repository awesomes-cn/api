const config = require('../config')
const jwt = require('jsonwebtoken')
const expireday = '10 days'

module.exports = {
  get_auth: async (req, res) => {
    res.send(res.locals.admin)
  },
  get_login: async (req, res) => {
    if (req.query.uid === config.admin.uid && req.query.pwd === config.admin.pwd) {
      let token = jwt.sign({uid: req.query.uid}, config.jwtkey, { expiresIn: expireday })
      res.send({
        status: true,
        token: token
      })
      return
    }
    res.send({
      status: false
    })
  }
}
