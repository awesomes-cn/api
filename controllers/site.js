const Link = require('../models/link')
const Msg = require('../models/msg')
const Release = require('../models/release')
const Subject = require('../models/subject')
const Mem = require('../models/mem')
const Cache = require('../lib/cache')

let memUsing = async () => {
  let random = parseInt(Math.random() * 10)
  let mems = await Mem.where('reputation', '>=', 20).where('using', '>=', 5)
  .query({
    orderByRaw: 'reputation desc',
    select: ['id', 'nc', 'avatar', 'using'],
    limit: 4,
    offset: random
  }).fetchAll({
    withRelated: [
      {
        'opers': query => {
          query.where({typ: 'REPO', opertyp: 'USING'}).select('id', 'mem_id', 'idcd')
        }
      },
      {
        'opers.repo': function (query) {
          query.select('alia', 'cover', 'owner', 'id', 'using')
        }
      }
    ]
  })
  return mems
}

let homeData = async () => {
  // 发布
  let releases = await Release.query({
    orderByRaw: 'published_at desc',
    limit: 5,
    select: ['tag_name', 'repo_id', 'published_at']
  }).fetchAll({
    withRelated: [{
      repo: query => {
        query.select('id', 'name', 'cover', 'full_name', 'owner', 'alia')
      }
    }]
  })

  // 专题
  let subs = await Subject.query({
    limit: 4,
    orderByRaw: '`order` desc',
    select: ['title', 'key', 'cover']
  }).fetchAll()
  return {
    releases: releases,
    subs: subs
    // weuses: mems
  }
}

module.exports = {
  // 获取友情链接
  get_friendlinks: (req, res) => {
    Link.query({
      orderByRaw: '`order` desc'
    }).fetchAll().then(items => {
      res.send(items)
    })
  },

  // 前端客申请
  post_apply: async (req, res) => {
    let memId = res.locals.mid
    if (!memId) {
      res.send({status: false})
      return
    }

    await new Msg({
      typ: 'webker-apply',
      title: '前端客申请',
      con: req.body.con,
      level: 'admin',
      from: memId
    }).save()

    res.send({status: true})
  },

  // 首页数据
  get_home: async (req, res) => {
    let data = await Cache.ensure(`home-index-data`, 60 * 60 * 12, homeData)
    data.weuses = await Cache.ensure(`home-index-weuses`, 60 * 60, memUsing)
    res.send(data)
  },

  // 大牛在用
  get_using: async (req, res) => {
    let itms = await memUsing()
    res.send(itms)
  }
}
