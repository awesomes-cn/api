const Msg = require('../models/msg')

module.exports = {
  get_index: async (req, res) => {
    let limit = Math.min((req.query.limit || 10), 20)
    let skip = parseInt(req.query.skip || 0)
    let domain = req.query.domain || 'main'
    let memId = res.locals.mid
    if (!memId) {
      res.send({status: false})
      return
    }
    let _where = {
      to: memId,
      domain: domain
    }

    let [items, count] = await Promise.all([
      Msg.query({
        where: _where,
        limit: limit,
        offset: skip,
        orderByRaw: 'id desc'
      }).fetchAll(),
      Msg.where(_where).count('id')
    ])

    res.send({
      items: items,
      count: count
    })
  },
  get_unread: async (req, res) => {
    let memId = res.locals.mid
    let domain = req.query.domain || 'main'
    if (!memId) {
      res.send({status: false})
      return
    }
    let count = await Msg.where({
      status: 'UNREAD',
      to: memId,
      domain: domain
    }).count('id')
    res.send({
      status: true,
      count: count
    })
  },
  post_reset: async (req, res) => {
    req.body.ids.forEach(async item => {
      await Msg.forge({
        id: item,
        status: 'READED'
      }).save()
    })
    res.send(true)
  }
}
