const MBlog = require('../models/microblog')
const Oper = require('../models/oper')
const Logic = require('../lib/logic')
const moment = require('moment')
const phantom = require('phantom')
const aliyun = require('../lib/aliyun')
const localEnv = require('../config.json')
const Cache = require('../lib/cache')
const algoliasearch = require('algoliasearch')

let searchGo = (key, hitsPerPage, page) => {
  if (!key || key.trim() === '') {
    return Promise.resolve({
      haseach: false,
      ids: []
    })
  }
  let cacheKey = `search-news-${key.trim()}-${page}`
  return Cache.ensure(cacheKey, 60 * 60 * 24 * 2, () => {
    let client = algoliasearch(localEnv.algolia.appId, localEnv.algolia.appKey)
    let index = client.initIndex('news')
    return new Promise(resolve => {
      index.search(key, {
        hitsPerPage: hitsPerPage,
        page: page
      }, function searchDone (err, content) {
        if (err) {
          resolve({
            haseach: true,
            ids: []
          })
          return
        }
        resolve({
          haseach: true,
          total: content.nbHits,
          ids: content.hits.map(item => {
            return item.objectID
          })
        })
      })
    })
  })
}

let formatQuery = (wheres) => {
  return wheres.reduce((result, item) => {
    return result.where(...item)
  }, MBlog)
}

module.exports = {
  get_index: async (req, res) => {
    let limit = Math.min((req.query.limit || 10), 100)
    let skip = parseInt(req.query.skip || 0)
    let wheres = []

    // 谁发布的
    if (req.query.author > 0) {
      wheres.push(['mem_id', '=', req.query.author])
    }

    // 谁收藏的
    let _collectby = req.query.collectby
    if (_collectby > 0) {
      let _opers = await Oper.where({
        typ: 'NEWS',
        opertyp: 'COLLECT',
        mem_id: _collectby
      }).fetchAll()
      let _nids = _opers.toJSON().map(item => {
        return item.idcd
      })
      wheres.push(['id', 'in', _nids])
    }

    let query = {
      limit: limit,
      offset: skip,
      orderByRaw: 'id desc'
    }
    let search = req.query.search
    let page = (skip / limit) + 1
    let result = await searchGo(search, limit, page - 1)

    if (result.haseach) {
      wheres.push(['id', 'in', result.ids])
    }

    let [newss, count, favors, collects] = await Promise.all([
      formatQuery(wheres).query(query).fetchAll({
        withRelated: [
          {
            'mem': function (mqu) {
              return mqu.select('id', 'nc', 'avatar')
            }
          }, {
            'mem.mem_info': function (query) {
              query.select('company', 'mem_id')
            }
          }]
      }),
      formatQuery(wheres).count('id'),
      Logic.fetchMyOpers(req, 'FAVOR', 'NEWS'),
      Logic.fetchMyOpers(req, 'COLLECT', 'NEWS')
    ])

    let resultData = newss.toJSON()
    resultData.forEach(item => {
      item.isFavor = favors.indexOf(item.id) > -1
      item.isCollect = collects.indexOf(item.id) > -1
    })

    res.send({
      items: resultData,
      count: result.haseach ? result.total : count
    })
  },

  // 获取最新
  get_latest: async (req, res) => {
    let limit = Math.min((req.query.limit || 10), 100)
    let latestID = req.query.lid
    let items = await MBlog.query({
      limit: limit,
      orderByRaw: 'id desc',
      offset: 0
    }).fetchAll()
    if (items.at(0).id > latestID) {
      let count = await MBlog.count('id')
      res.send({
        hasnew: true,
        items: items,
        count: count
      })
    } else {
      res.send({
        hasnew: false
      })
    }
  },

  get_index_id: async (req, res) => {
    let item = await MBlog.query({where: {id: req.params.action}}).fetch({
      withRelated: [
        {
          'mem': function (mqu) {
            return mqu.select('id', 'nc', 'avatar')
          }
        }, {
          'mem.mem_info': function (query) {
            query.select('company', 'mem_id')
          }
        }]
    })
    res.send(item)
  },

  post_index: async (req, res) => {
    let me = await Logic.me(res)
    if (!me || me.get('iswebker') === 'NO') {
      res.send({status: false})
      return
    }
    let params = {mem_id: me.id}
    ;['con', 'picture'].forEach(key => {
      params[key] = req.body[key]
    })

    let item = await new MBlog(params).save()
    let newItem = await MBlog.where({id: item.get('id')}).fetch({
      withRelated: [
        {
          'mem': function (mqu) {
            return mqu.select('id', 'nc', 'avatar')
          }
        }, {
          'mem.mem_info': function (query) {
            query.select('company', 'mem_id')
          }
        }]
    })

    res.send({status: true, item: newItem})
  },

  delete_index_id: async (req, res) => {
    let memId = res.locals.mid
    let item = await MBlog.query({where: {id: req.params.action}}).fetch()
    if (item.get('mem_id') !== memId) {
      res.send({status: false})
      return
    }
    await item.destroy()
    res.send({status: true})
  },

  put_index_id: async (req, res) => {
    let memId = res.locals.mid
    let item = await MBlog.query({where: {id: req.params.action}}).fetch()
    if (item.get('mem_id') !== memId) {
      res.send({status: false})
      return
    }
    if (req.body.con !== item.get('con') || req.body.picture !== item.get('picture')) {
      item.set('screenshot', null)
    }

    ;['con', 'picture'].forEach(key => {
      item.set(key, req.body[key])
    })
    item.save().then(() => {
      res.send({status: true})
    })
  },

  // 最佳
  get_best: (req, res) => {
    let period = req.query.period
    let query = MBlog

    let firstDay = {
      week: moment().days(-7).format(),
      month: moment().days(-30).format()
    }[period]

    if (firstDay) {
      query = query.where('created_at', '>', firstDay)
    }

    query.query({
      orderByRaw: 'favor desc'
    }).fetch({
      withRelated: [
        {
          'mem': function (mqu) {
            return mqu.select('id', 'nc', 'avatar')
          }
        }, {
          'mem.mem_info': function (query) {
            query.select('company', 'mem_id')
          }
        }]
    }).then(item => {
      if (item) {
        res.send(item)
      } else {
        res.send('nobest')
      }
    })
  },

  get_prevnext: async (req, res) => {
    let currentID = parseInt(req.params.id)
    let direction = req.query.direction
    let dist = null
    if (direction === 'prev') {
      dist = await MBlog.where('id', '<', currentID).query({
        limit: 1,
        orderByRaw: 'id desc'
      }).fetch()
    } else {
      dist = await MBlog.where('id', '>', currentID).query({
        limit: 1
      }).fetch()
    }
    res.send({
      dist: (dist ? dist.id : 0)
    })
  },

  get_screenshot: async (req, res) => {
    let item = await MBlog.query({where: {id: req.params.id}}).fetch()
    if (item.get('screenshot')) {
      res.send(item.get('screenshot'))
      return
    }

    let filename = `${req.params.id}.png`
    let distName = `news/screenshot/${filename}`

    const instance = await phantom.create()
    const page = await instance.createPage()
    await page.open(`${localEnv.client.news}/news/${req.params.id}/screenshot`)
    var base64 = await page.renderBase64('PNG')
    var buffer = new Buffer(base64, 'base64')
    await aliyun.upload(buffer, distName)
    await instance.exit()
    item.set('screenshot', filename)
    await item.save()
    res.send(filename)
  }
}
