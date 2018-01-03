const FeexCatalog = require('../models/feex_catalog')
const Feex = require('../models/feex')

// 权限
let isMyFeex = async (res, fid) => {
  let memId = res.locals.mid
  let _feex = await Feex.where({
    id: fid
  }).fetch()
  if (!_feex || !memId) { return false }
  return _feex.get('mem_id') === memId
}

module.exports = {

  // 删除
  delete_index_id: async (req, res) => {
    let item = await FeexCatalog.where({
      id: req.params.action
    }).fetch()
    if (!await isMyFeex(res, item.get('feex_id'))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    let children = await FeexCatalog.where({
      parent: item.id
    }).fetchAll()
    children.push(item)
    await Promise.all(children.map(item => {
      item.destroy()
    }))
    res.send({
      status: true
    })
  },

  put_index_id: async (req, res) => {
    let item = await FeexCatalog.where({
      id: req.params.action
    }).fetch()

    if (!await isMyFeex(res, item.get('feex_id'))) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }

    ;['id', 'title', 'feex_file_id', 'isfree', 'parent', 'feex_structure_id'].forEach(key => {
      if (req.body[key] !== undefined) {
        item.set(key, req.body[key])
      }
    })
    let resitem = await item.save()
    res.send({
      status: true,
      item: resitem
    })
  },

  put_sort: async (req, res) => {
    let dist = req.body.dist
    let cates = await FeexCatalog.where('id', 'in', dist).fetchAll()
    cates = cates.toJSON()
    if (!await isMyFeex(res, cates[0].feex_id)) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }
    // 验证
    let tmp = cates[0].ordernum
    cates[0].ordernum = cates[1].ordernum
    cates[1].ordernum = tmp
    await FeexCatalog.forge(cates[0]).save()
    await FeexCatalog.forge(cates[1]).save()
    res.send({
      status: true
    })
  }
}
