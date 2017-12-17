const Feex = require('../models/feex')
const FeexCatalog = require('../models/feex_catalog')
const FeexStructure = require('../models/feex_structure')

// 权限
let isMyFeex = async (res, fid) => {
  return true
  let memId = res.locals.mid
  let _feex = await Feex.where({
    id: fid
  }).fetch()
  if (!_feex) { return false }
  return _feex.mem_id === memId
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

  get_structure: async (req, res) => {
    let items = await FeexStructure.where({
      feex_id: req.params.id
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
    res.send({
      status: true,
      item: resitem
    })
  },

  put_structure: async (req, res) => {
    let _feexst = await FeexStructure.where({
      id: req.body.id
    }).fetch()

    if (!_feexst) {
      res.sendStatus(404)
      res.send('404')
      return
    }

    if (!isMyFeex(res, _feexst.feex_id)) {
      res.sendStatus(401)
      res.send({status: false})
      return
    }

    let item = {}
    ;['id', 'name', 'file_from', 'file_upload', 'feex_file_id', 'parent'].forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })
    let resitem = await FeexStructure.forge(item).save()
    res.send({
      status: true,
      item: resitem
    })
  },

  delete_structure: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.query.id
    }).fetch()
    await item.destroy()
    res.send({
      status: true
    })
  }
}
