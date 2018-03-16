const Mem = require('../models/mem')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Config = require('../config')

module.exports = {
  // 登录
  post_login: (req, res) => {
    let uid = req.body.uid
    let pwd = crypto.createHash('md5').update(req.body.pwd).digest('hex')
    Mem.where({email: uid, pwd: pwd}).fetch().then(data => {
      if (data) {
        let token = jwt.sign({ id: data.id }, Config.jwtkey, { expiresIn: '240h' })
        res.send({
          status: true,
          token: token,
          mem: {
            id: data.id,
            nc: data.get('nc'),
            avatar: data.get('avatar'),
            iswebker: data.get('iswebker')
          }
        })
      } else {
        res.send({status: false})
      }
    })
  },

  get_index: (req, res) => {
    if (!req.headers.atoken) {
      res.send({status: false})
      return
    }
    let memId = res.locals.mid
    if (!memId) {
      res.send({status: false})
      return
    }
    Mem.where({id: memId}).fetch().then(data => {
      if (data) {
        let token = jwt.sign({ id: data.id }, Config.jwtkey, { expiresIn: '5h' })
        res.send({
          status: true,
          token: token,
          mem: {
            id: data.id,
            nc: data.get('nc'),
            avatar: data.get('avatar'),
            iswebker: data.get('iswebker')
          }
        })
      } else {
        res.send({status: false})
      }
    })
  }
}
