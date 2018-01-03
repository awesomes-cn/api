const FeexStructure = require('../models/feex_structure')
const HelperFeexRSP = require('../helper/feex/reset_structure_path')
const Feex = require('../models/feex')
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

let hasBuy = async (res, fitem) => {
  // 试学
  let memId = res.locals.mid
  if (!memId) {
    return false
  }
  let _log = await FeexSaleLog.where({
    mem_id: memId,
    feex_id: fitem.get('feex_id')
  }).fetch()
  return _log ? true : false
}

module.exports = {
  get_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()
    if (!(await isMyFeex(res, item.get('feex_id')) || await hasBuy(res, item))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    res.send(item)
  },

  delete_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()
    if (!await isMyFeex(res, item.get('feex_id'))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    await item.destroy()
    res.send({
      status: true
    })
  },

  put_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()

    if (!await isMyFeex(res, item.get('feex_id'))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }

    ;['id', 'name', 'file_from', 'file_upload', 'feex_file_id', 'parent', 'file_con'].forEach(key => {
      if (req.body[key] !== undefined) {
        item.set(key, req.body[key])
      }
    })
    let resitem = await item.save()
    if (req.body.name !== undefined) {
      await HelperFeexRSP((await FeexStructure.where({
        id: item.id
      }).fetch()).toJSON())
    }

    res.send({
      status: true,
      item: resitem
    })
  }
}
