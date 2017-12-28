const jwt = require('jsonwebtoken')
const Oper = require('../models/oper')
const Mem = require('../models/mem')
const Config = require('../config')

let Logic = {

  // 获取当前登录会员喜欢(XX)的小报(XX)ID数组
  fetchMyOpers: async (req, opertyp, typ) => {
    if (!req.headers.atoken) {
      return []
    }
    let memId = Logic.myid(req)
    if (!memId) {
      return []
    }

    let opers = await Oper.query({
      where: {opertyp: opertyp, typ: typ, mem_id: memId},
      select: ['idcd']
    }).fetchAll()

    return opers.map(item => {
      return item.get('idcd')
    })
  },

  // 获取当前登录会员ID
  myid: (req) => {
    try {
      return (jwt.verify(req.headers.atoken, Config.jwtkey) || {}).id
    } catch (ex) {
      return null
    }
  },

  // 获取当前登录会员
  me: async (res) => {
    let memId = res.locals.mid
    if (!memId || memId < 1) { return null }
    return await Mem.where({id: memId}).fetch()
  }

}

module.exports = Logic
