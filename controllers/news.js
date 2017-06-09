const MBlog = require('../models/microblog')
const Logic = require('../lib/logic')
const moment = require('moment')
module.exports = {
  get_test: async (req, res) => {
    res.send(res.locals.login)
  },
  get_index: async (req, res) => {
    let limit = Math.min((req.query.limit || 10), 100)
    let skip = parseInt(req.query.skip || 0)
    let where = {}
    if (req.query.mem > 0) {
      where = {
        mem_id: req.query.mem
      }
    }
    let query = {
      limit: limit,
      offset: skip,
      orderByRaw: 'id desc',
      where: where
    }

    let [count, newss, favors] = await Promise.all([
      MBlog.where(where).count('id'),
      MBlog.query(query).fetchAll({
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
      Logic.fetchMyOpers(req, 'FAVOR', 'NEWS')
    ])

    let result = newss.toJSON()
    result.forEach(item => {
      item.isFavor = favors.indexOf(item.id) > -1
    })

    res.send({
      items: result,
      count: count
    })
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
    ;['con'].forEach(key => {
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
    item.set('con', req.body.con)
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
  }
}
