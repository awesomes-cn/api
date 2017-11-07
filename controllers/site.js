const Link = require('../models/link')
const Msg = require('../models/msg')
const Release = require('../models/release')
const Subject = require('../models/subject')
const Mem = require('../models/mem')
const Oper = require('../models/oper')
const Cache = require('../lib/cache')

let memUsing = async mids => {
  return await Oper.where({typ: 'REPO', opertyp: 'USING'}).where('mem_id', 'in', mids).query({
    select: ['idcd', 'mem_id']
  }).fetchAll({
    withRelated: [{
      'repo': function (query) {
        query.select('alia', 'cover', 'owner', 'id', 'using')
      }
    }]
  })
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

  // 大牛在用
  let mems = await Mem.where('reputation', '>=', 20).where('using', '>=', 5)
  .query({
    orderByRaw: 'reputation desc',
    select: ['id', 'nc', 'avatar', 'using'],
    limit: 4
  }).fetchAll()
  mems = mems.toJSON()
  let mids = mems.map(mem => {
    return mem.id
  })

  let usings = await memUsing(mids)
  mems.forEach(mem => {
    mem.usings = usings.filter(item => {
      return item.get('mem_id') === mem.id
    }).slice(0, 5).map(item => {
      return item.related('repo')
    })
  })
  return {
    releases: releases,
    subs: subs,
    weuses: mems
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
    let cacheKey = `home-info-data`
    let data = await Cache.ensure(cacheKey, 60 * 60, homeData)
    res.send(data)
  }
}
