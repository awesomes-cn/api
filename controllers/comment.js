const Comment = require('../models/comment')
const Oper = require('../models/oper')
const Config = require('../config')

// 获取当前登录会员喜欢的评论
let getMyFavors = (req, res) => {
  if (!req.headers.atoken) {
    return Promise.resolve([])
  }
  let memId = res.locals.mid
  if (!memId) {
    return Promise.resolve([])
  }
  return new Promise(resolve => {
    Oper.query({
      where: {opertyp: 'FAVOR', typ: 'COMMENT', mem_id: memId},
      select: ['idcd']
    }).fetchAll().then(opers => {
      resolve(opers.map(item => {
        return item.get('idcd')
      }))
    })
  })
}

module.exports = {
  get_index: async (req, res) => {
    let limit = Math.min((req.query.limit || 30), 100)
    let skip = parseInt(req.query.skip || 0)
    let where = {}
    let order = req.query.order
    ;['typ', 'idcd', 'mem_id'].forEach(key => {
      let val = req.query[key]
      if (val) {
        where[key] = val
      }
    })
    let query = {
      where: where,
      limit: limit,
      offset: skip,
      orderByRaw: order || 'id asc'
    }

    let [comments, count, myfavors] = await Promise.all([
      Comment.query(query).fetchAll({
        withRelated: [{
          'mem': function (mqu) {
            return mqu.select('id', 'nc', 'avatar')
          }
        }]
      }),
      Comment.where(where).count('id'),
      getMyFavors(req, res)
    ])
    let result = comments.toJSON()
    result.forEach(item => {
      item.isFavor = myfavors.indexOf(item.id) > -1
    })
    res.send({
      items: result,
      count: count
    })
  },
  post_index: async (req, res) => {
    let memId = res.locals.mid
    if (!memId) {
      res.send({status: false})
      return
    }
    let params = {mem_id: memId}
    ;['typ', 'idcd', 'con'].forEach(key => {
      params[key] = req.body[key]
    })

    let newItem = await new Comment(params).save()
    let backitem = await Comment.where({id: newItem.get('id')}).fetch({
      withRelated: [{
        'mem': function (mqu) {
          return mqu.select('id', 'nc', 'avatar')
        }
      }]
    })

    res.send({status: true, item: backitem})
  },

  // 删除
  delete_index_id: (req, res) => {
    let memId = res.locals.mid
    Comment.query({where: {id: req.params.action}}).fetch().then(item => {
      if (item.get('mem_id') !== memId) {
        res.send({status: false})
        return
      }

      let pwoutsesion = {}
      ;['idcd', 'typ'].forEach(key => {
        pwoutsesion[key] = item.get(key)
      })

      item.destroy().then(() => {
        Comment.updateTarget(new Comment(pwoutsesion)).then(() => {
          res.send({status: true})
        })
      })
    })
  },

  // 更新
  put_index_id: (req, res) => {
    let memId = res.locals.mid
    Comment.query({where: {id: req.params.action}}).fetch().then(item => {
      if (item.get('mem_id') !== memId) {
        res.send({status: false})
        return
      }
      item.set('con', req.body.con)
      item.save().then(() => {
        res.send({status: true})
      })
    })
  },

  // target
  get_target: async (req, res) => {
    let _comment = await Comment.where({
      id: req.params.id
    }).fetch()
    let Model = {
      REPO: {
        route: async () => {
          let Repo = require('../models/repo')
          let _repo = await Repo.where({id: _comment.get('idcd')}).fetch()
          return `${Config.client.main}/repo/${_repo.get('owner')}/${_repo.get('alia')}`
        }
      },
      NEWS: {
        route: `${Config.client.news}/news/${_comment.get('idcd')}`
      }
    }[_comment.get('typ')]
    let url = (typeof Model.route === 'string') ? Model.route : await Model.route()
    res.redirect(url)
  }
}
