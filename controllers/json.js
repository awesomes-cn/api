const Json = require('../models/json')

module.exports = {
  post_index: async (req, res) => {
    let con = req.body.con
    if (con.length < 5 || con.length > 100000) {
      res.send({status: false})
      return
    }
    let key = req.body.key
    await Json.forge({
      key: req.body.key,
      con: req.body.con
    }).save()
    res.send({status: true, key: key})
  },
  get_index: async (req, res) => {
    let item = await Json.where({
      key: req.query.key
    }).fetch()
    res.send({
      status: item ? true : false,
      item: item
    })
  }
}
