const Feex = require('../models/feex')
const FeexCatalog = require('../models/feex_catalog')
const FeexStructure = require('../models/feex_structure')
const HelperFeexRSP = require('../helper/feex/reset_structure_path')
const FeexSaleLog = require('../models/feex_sale_log')

// 权限
let isMyFeex = async (res, fid) => {
  let memId = res.locals.mid
  let _feex = await Feex.where({
    id: fid
  }).fetch()
  if (!_feex || !memId) { return false }
  return _feex.get('mem_id') === memId
}

let hasBuy = async (res, fid) => {
  // 试学
  let memId = res.locals.mid
  if (!memId) {
    return false
  }
  let _log = await FeexSaleLog.where({
    mem_id: memId,
    feex_id: fid
  }).fetch()
  return _log ? true : false
}

module.exports = {
  get_index: async (req, res) => {
    let items = await Feex.query({
      orderByRaw: 'created_at desc',
      where: {
        ison: 'Y'
      }
    }).fetchAll({
      withRelated: [{
        mem: query => {
          query.select('id', 'nc', 'avatar')
        }
      }]
    })
    res.send({
      items: items
    })
  },

  get_index_id: async (req, res) => {
    let _related = {}
    if (req.query.relation) {
      _related = {
        withRelated: ['catalogs', {
          mem: query => {
            query.select('id', 'nc', 'avatar')
          }
        }]
      }
    }

    let item = await Feex.where({
      id: req.params.action
    }).fetch(_related)
    res.send(item)
  },

  put_index: async (req, res) => {
    let _feex = await Feex.where({
      id: req.body.id
    }).fetch()

    if (!await isMyFeex(res, _feex.id)) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }

    ;['title', 'price', 'summary', 'cover'].forEach(key => {
      _feex.set(key, req.body[key])
    })

    await _feex.save()
    res.send({
      status: true
    })
  },

  post_index: async (req, res) => {
    // if (!await isMyFeex(res, _feex.id)) {
    //   res.sendStatus(401)
    //   res.send({status: false})
    //   return
    // }
    let _feex = Feex.forge({
      mem_id: 1
    })

    ;['title', 'price', 'summary', 'cover'].forEach(key => {
      _feex.set(key, req.body[key])
    })

    _feex = await _feex.save()
    res.send({
      status: true,
      item: _feex
    })
  },

  get_catalog: async (req, res) => {
    let items = await FeexCatalog.where({
      feex_id: req.params.id
    }).fetchAll()
    res.send({
      items: items
    })
  },

  post_catalog: async (req, res) => {
    if (!await isMyFeex(res, req.params.id)) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    let item = {
      'feex_id': req.params.id
    }
    ;['title', 'feex_file_id', 'isfree', 'parent'].forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })
    // 排序
    let _maxorderItem = await FeexCatalog.where({
      'feex_id': req.params.id
    }).query({
      orderByRaw: 'ordernum desc',
      limit: 1
    }).fetch()
    let _order = _maxorderItem ? (_maxorderItem.get('ordernum') + 1) : 1
    item.ordernum = _order
    let resitem = await FeexCatalog.forge(item).save()
    res.send({
      status: true,
      item: resitem
    })
  },

  get_structure: async (req, res) => {
    if (!(await isMyFeex(res, req.params.id) || await hasBuy(res, req.params.id))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    let items = await FeexStructure.where({
      feex_id: req.params.id
    }).query({
      select: ['id', 'feex_id', 'name', 'type', 'file_from', 'parent', 'file_upload']
    }).fetchAll()
    res.send({
      items: items
    })
  },

  post_structure: async (req, res) => {
    if (!isMyFeex(res, req.params.id)) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    let item = {
      'feex_id': req.params.id
    }
    ;['name', 'type', 'file_from', 'file_upload', 'feex_file_id', 'parent'].forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })
    let resitem = await FeexStructure.forge(item).save()
    // await uploadFileConToAliyun(resitem)
    await HelperFeexRSP(resitem.toJSON())
    res.send({
      status: true,
      item: resitem
    })
  }
}
