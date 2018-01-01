const Feex = require('../models/feex')
const FeexCatalog = require('../models/feex_catalog')
const FeexStructure = require('../models/feex_structure')
const path = require('path')
const aliyun = require('../lib/aliyun')
const HelperFeexRSP = require('../helper/feex/reset_structure_path')
const localEnv = require('../config')

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

// 上传某个文件的内容到阿里云上
// let uploadFileConToAliyun = async (feex) => {
//   let filename = `feex/${feex.id}${path.extname(feex.get('name'))}`
//   await aliyun.uploadTxt(feex.get('file_con'), filename)
// }

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
    if (!isMyFeex(res, req.params.id)) {
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

  put_catalog: async (req, res) => {
    let _feexst = await FeexCatalog.where({
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
    ;['id', 'title', 'feex_file_id', 'isfree', 'parent'].forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })
    let resitem = await FeexCatalog.forge(item).save()
    res.send({
      status: true,
      item: resitem
    })
  },

  delete_catalog: async (req, res) => {
    let item = await FeexCatalog.where({
      id: req.query.id
    }).fetch()
    let children = await FeexCatalog.where({
      parent: req.query.id
    }).fetchAll()
    children.push(item)
    await Promise.all(children.map(item => {
      item.destroy()
    }))
    res.send({
      status: true
    })
  },

  put_catalog_sort: async (req, res) => {
    let dist = req.body.dist
    let cates = await FeexCatalog.where('id', 'in', dist).fetchAll()
    cates = cates.toJSON()
    // 验证
    let tmp = cates[0].ordernum
    cates[0].ordernum = cates[1].ordernum
    cates[1].ordernum = tmp
    await FeexCatalog.forge(cates[0]).save()
    await FeexCatalog.forge(cates[1]).save()
    res.send({
      status: true
    })
  },

  get_structure: async (req, res) => {
    let items = await FeexStructure.where({
      feex_id: req.params.id
    }).query({
      select: ['id', 'feex_id', 'name', 'type', 'file_from', 'parent', 'file_upload']
    }).fetchAll()
    res.send({
      items: items
    })
  },

  get_structure_con: async (req, res) => {
    let st = await FeexStructure.where({
      id: req.query.id
    }).fetch()
    res.send({
      con: st.get('file_con')
    })
  },

  get_structure_raw_con: async (req, res) => {
    let st = await FeexStructure.where({
      id: req.query.id
    }).fetch()
    let exta = (path.extname(st.get('name')) || '').toLocaleLowerCase()
    let ctype = {
      '.css': 'text/css',
      '.js': 'application/x-javascript'
    }[exta] || ''
    res.set('Content-Type', ctype)
    res.send(st.get('file_con'))
  },

  // 获取某个文件真实的连接地址
  get_structure_link: async (req, res) => {
    let st = await FeexStructure.where({
      path: req.query.path
    }).fetch()
    if (!st) {
      res.send('')
      return
    }
    if (st.get('file_from') === 'file') {
      res.send(`${localEnv.server.url}feex/structure_raw_con?id=${st.id}`)
    } else {
      res.send('/feex/structure_link?name=css/main.css')
    }
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
    ;['id', 'name', 'file_from', 'file_upload', 'feex_file_id', 'parent', 'file_con'].forEach(key => {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key]
      }
    })
    let resitem = await FeexStructure.forge(item).save()
    // await uploadFileConToAliyun(await FeexStructure.where({
    //   id: req.body.id
    // }).fetch())
    if (req.body.name !== undefined) {
      await HelperFeexRSP((await FeexStructure.where({
        id: req.body.id
      }).fetch()).toJSON())
    }

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
