const Mem = require('../models/mem')
const MemInfo = require('../models/mem_info')
const Oper = require('../models/oper')
const Auth = require('../middleware/auth')

module.exports = {
  get_index_id: async (req, res) => {
    let data = await Mem.query({
      where: {id: req.params.action},
      select: ['id', 'nc', 'avatar', 'using']
    }).fetch({
      withRelated: ['mem_info']
    })
    // 由于没有收藏次数的冗余字段 只能临时去取了
    data = data.toJSON()
    data.marks = await Oper.where({
      opertyp: 'MARK',
      typ: 'REPO',
      mem_id: req.params.action
    }).count('id')
    res.send(data)
  },

  get_opers: function (req, res) {
    let limit = Math.min((req.query.limit || 10), 100)
    let skip = parseInt(req.query.skip || 0)
    let where = {
      mem_id: req.params.id
    }
    ;['opertyp', 'idcd', 'typ'].forEach(key => {
      if (req.query[key]) {
        where[key] = req.query[key]
      }
    })
    Promise.all([Oper.where(where).count('id'),
      Oper.query({
        where: where,
        limit: limit,
        offset: skip,
        orderByRaw: 'created_at desc'
      }).fetchAll({
        withRelated: [{
          'repo': function (query) {
            query.select('alia', 'cover', 'owner', 'id', 'using', 'stargazers_count', 'description_cn', 'description', 'rootyp', 'rootyp_zh', 'typcd', 'typcd_zh', 'mark')
          }
        }]
      })
    ]).then(([count, items]) => {
      res.send({
        items: items,
        count: count
      })
    })
  },

  // 我在用
  get_using: (req, res) => {
  },

  // 设置为情报员
  post_setwebker: async (req, res) => {
    await Auth.isAdmin(req, res)
    let mem = await Mem.where({id: req.params.id}).fetch()
    mem.set('iswebker', 'YES')
    await mem.save()
    res.send({status: true})
  },

  // 更新
  put_index: async (req, res) => {
    let _info = req.body.mem.mem_info
    let memId = res.locals.mid
    let _mem = await Mem.where({id: memId}).fetch({
      withRelated: ['mem_info']
    })
    if (!memId || memId !== req.body.mem.id) {
      res.send({status: false})
      return
    }
    let data = {
      id: _mem.related('mem_info').id
    }
    ;['gender', 'location', 'html_url', 'blog', 'github', 'twitter', 'weibo_url', 'company'].forEach(key => {
      data[key] = _info[key]
    })
    await MemInfo.forge(data).save()
    await Mem.forge({
      id: memId,
      avatar: req.body.mem.avatar
    }).save()
    res.send({status: true})
  }
}
