// 后台数据中心
const Auth = require('../middleware/auth')
const maps = {
  mem: {
    get: {
      params: ['nc', 'email'],
      withRelated: ['mem_info']
    }
  },
  comment: {
    get: {
      params: ['typ'],
      withRelated: [{
        mem: query => {
          query.select('id', 'nc')
        },
        repo: query => {
          query.select('name', 'full_name', 'id')
        }
      }]
    },
    delete: true
  },
  repo: {
    get: {
      params: ['full_name'],
      fields: 'id,full_name,description,description_cn,comment,score,using'
    },
    get_id: {},
    delete: true
  },
  submit: {
    get: {
    },
    delete: true
  },
  menutyp: {
    get: {
      params: ['key', 'sdesc', 'typcd', 'parent']
    },
    post: {
      keys: ['key', 'sdesc', 'typcd', 'parent', 'icon', 'fdesc']
    },
    put: {
      keys: ['key', 'sdesc', 'typcd', 'parent', 'icon', 'fdesc']
    },
    delete: true
  }
}

// 构建查询
let formarWhere = (model, where, whereArr) => {
  return whereArr.reduce((result, item) => {
    return result.where(...item)
  }, model.where(where))
}

module.exports = {
  get_index: async (req, res) => {
    await Auth.isAdmin(req, res)
    let limit = Math.min((req.query.limit || 15), 1000)
    // let skip = parseInt(req.query.skip || 0)
    // let page = parseInt(req.query.page || 1)
    let skip = parseInt(req.query.skip || 0)
    let keywords = req.query.keywords
    let _table = maps[req.query.table]

    if (!_table || !_table.get) {
      res.send({
        status: '400'
      })
      return
    }
    let Model = require(`../models/${_table.table || req.query.table}`)
    let CountModel = require(`../models/${_table.table || req.query.table}`)
    // if (keywords) {
    //   keywords.forEach(kw => {
    //     kw = JSON.parse(kw)
    //     // 如果是数组 区间 >  <
    //     if (typeof kw[1] === 'object') {
    //       // 日期区间
    //       if (kw[1].type === 'date') {
    //         let _start = kw[1].start
    //         let _end = kw[1].end
    //         if (_start) {
    //           Model = Model.where(kw[0], '>=', _start)
    //           CountModel = CountModel.where(kw[0], '>=', _start)
    //         }
    //         if (_end) {
    //           Model = Model.where(kw[0], '<=', _end)
    //           CountModel = CountModel.where(kw[0], '>=', _end)
    //         }
    //       }
    //     } else {
    //       kw[0].split(',').forEach((key, i) => {
    //         if (i === 0) {
    //           Model = Model.where(key, 'like', `%${kw[1]}%`)
    //           CountModel = CountModel.where(key, 'like', `%${kw[1]}%`)
    //         } else {
    //           Model = Model.orWhere(key, 'like', `%${kw[1]}%`)
    //           CountModel = CountModel.orWhere(key, 'like', `%${kw[1]}%`)
    //         }
    //       })
    //     }
    //   })
    // }

    let _where = {}
    let _whereArr = []
    let reqwhere = JSON.parse(req.query.where || '{}')

    ;(_table.get.params || []).forEach(key => {
      if (reqwhere[`search_${key}`] !== undefined) {
        Model = Model.where(key, 'like', `%${reqwhere[`search_${key}`]}%`)
        CountModel = CountModel.where(key, 'like', `%${reqwhere[`search_${key}`]}%`)
      }
      if (reqwhere[key] !== undefined) {
        _where[key] = reqwhere[key]
      }
    })
    let _query = {
      orderByRaw: _table.get.order || 'id DESC',
      limit: limit,
      offset: skip
    }

    if (req.query.fields) {
      _query.select = req.query.fields.split(',').concat('id')
    }

    let [items, count] = await Promise.all([
      formarWhere(Model, _where, _whereArr).query(_query).fetchAll({
        withRelated: _table.get.withRelated || []
      }),
      formarWhere(CountModel, _where, _whereArr).count('id')
    ])
    res.send({
      status: '200',
      data: [{
        items: items,
        count: count
      }]
    })
  },

  get_detail: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = maps[req.query.table]
    if (!_table || !_table.get_id) {
      res.send({
        status: false
      })
      return
    }
    let Model = require(`../models/${_table.table || req.query.table}`)
    let _where = {}
    ;['id'].concat(_table.get_id.ids || []).forEach(key => {
      if (req.query[key]) {
        _where[key] = req.query[key]
      }
    })
    let _query = {}
    if (req.query.fields) {
      _query.select = req.query.fields.split(',').concat('id')
    }

    let item = await Model.query(_query).where(_where).fetch({
      withRelated: _table.get_id.withRelated || []
    })
    res.send({
      status: '200',
      data: [
        item
      ]
    })
  },

  get_count: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = maps[req.query.table]
    if (!_table || !_table.get_count) {
      res.send({
        status: false
      })
      return
    }
    let Model = require(`../models/${_table.table || req.query.table}`)
    let _where = _table.get_count.where
    let _count = await Model.where(_where).count('id')
    res.send({
      status: '200',
      data: [
        _count
      ]
    })
  },

  post_index: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = maps[req.query.table]
    if (!_table || !_table.post) {
      res.send({
        status: '500'
      })
      return
    }
    let Model = require(`../models/${_table.table || req.query.table}`)
    let data = {}
    ;(_table.post.keys || []).forEach(key => {
      data[key] = req.body[key]
    })

    // 是否允许
    let beforeResult = { errorMsg: null }
    if (_table.beforeSave) {
      await _table.beforeSave(req.body, beforeResult)
    }
    if (beforeResult.errorMsg) {
      res.send({
        status: '400',
        message: beforeResult.errorMsg
      })
      return
    }
    let item = await Model.forge(data).save()
    if (_table.afterSave) {
      item = await Model.where({id: item.id}).fetch() // 某些自动生成的字段是不会在item上的
      await _table.afterSave(item, req)
    }
    res.send({
      status: '200',
      data: [
        {
          item: item
        }
      ]
    })
  },

  put_index: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = maps[req.query.table]
    if (!_table || !_table.put) {
      res.send({
        status: '400'
      })
      return
    }

    // 是否允许
    let beforeResult = { errorMsg: null }
    if (_table.beforeSave) {
      await _table.beforeSave(req.body, beforeResult)
    }
    if (beforeResult.errorMsg) {
      res.send({
        status: '400',
        message: beforeResult.errorMsg
      })
      return
    }

    let Model = require(`../models/${_table.table || req.query.table}`)
    let _item = await Model.where({
      id: req.body.id
    }).fetch()
    if (!_item) {
      res.send({
        status: '400',
        message: '对象不存在！'
      })
      return
    }
    ;(_table.put.keys || []).forEach(key => {
      if (req.body[key] !== undefined) {
        _item.set(key, req.body[key])
      }
    })

    await _item.save()
    if (_table.afterSave) {
      await _table.afterSave(_item, req)
    }
    res.send({
      status: '200',
      data: [
        {
          item: _item
        }
      ]
    })
  },

  delete_index: async (req, res) => {
    await Auth.isAdmin(req, res)
    let _table = maps[req.query.table]
    if (!_table || !_table.delete) {
      res.send({
        status: false
      })
      return
    }
    let Model = require(`../models/${_table.table || req.query.table}`)
    let item = await Model.where({
      id: req.query.id
    }).fetch()
    if (item.get('islock') === 'y') {
      res.send({
        status: '400',
        error: '不能删除'
      })
      return
    }
    await item.destroy()
    res.send({
      status: '200'
    })
  }
}
