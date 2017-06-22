const Auth = require('../middleware/auth')
const TableMap = {
  mem: {
    keys: ['nc', 'email', 'wealth']
  },
  submit: {
    keys: ['html_url', 'typcd', 'status']
  },
  webkerapply: {
    table: 'msg',
    where: {level: 'admin', typ: 'webker-apply'},
    keys: ['con', 'from']
  }
}

module.exports = {
  get_tables: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = req.query.table
    let limit = 20
    let skip = parseInt(req.query.skip || 0)
    let map = TableMap[_table]
    _table = map.table || _table
    let Table = require(`../models/${_table}`)
    let _where = map.where || {}
    let _keys = map.keys.concat(['id', 'created_at'])
    let [items, count] = await Promise.all([
      Table.query({
        where: _where,
        limit: limit,
        offset: skip,
        select: _keys,
        orderByRaw: 'id desc'
      }).fetchAll(),
      Table.where(_where).count('id')
    ])
    res.send({
      items: items,
      count: count
    })
  },
  post_destroy: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = req.body.table
    let map = TableMap[_table]
    _table = map.table || _table
    let maps = ['mem', 'submit', 'msg']
    if (maps.indexOf(_table) < 0) {
      res.send({
        status: false
      })
    }
    let Table = require(`../models/${_table}`)
    await new Table({id: req.body.id}).destroy()
    res.send({
      status: true
    })
  }
}
