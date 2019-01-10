
const config = require('../config')
module.exports = {
  isAdmin: async (req, res) => {
    if (res.locals.admin !== config.admin.uid) {
      res.sendStatus(401)
      res.send('no power')
    }
  }
}
