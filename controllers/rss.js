var RSS = require('rss')
const Repo = require('../models/repo')
const Subscribe = require('../models/subscribe')
// const moment = require('moment')

module.exports = {
  get_index: async (req, res) => {
    // let startDay = moment().add(-7, 'days').format()
    let repos = await Repo.query({
      orderByRaw: 'id desc',
      limit: 10
    }).fetchAll()

    var feed = new RSS({
      title: 'Awesomes-前端资源库',
      description: '免费开源的高质量前端库、框架和插件',
      feed_url: 'https://www.awesomes.cn/rss',
      site_url: 'https://www.awesomes.cn/',
      webMaster: 'hxh',
      copyright: 'Copyright © 2016-2020 Awesomes.cn 1.0.0.',
      language: 'zh-cn',
      categories: ['前端库', '前端情报']
    })

    repos.forEach(item => {
      feed.item({
        title: item.get('name'),
        description: item.get('description_cn') || item.get('description'),
        categories: [`${item.get('rootyp_zh')}, ${item.get('typcd_zh')}`],
        url: `https://www.awesomes.cn/repo/${item.get('owner')}/${item.get('alia')}`,
        author: item.get('owner'),
        date: item.get('github_created_at')
      })
    })

    // cache the xml to send to clients
    var xml = feed.xml()
    res.set('Content-Type', 'text/xml')
    res.send(xml)
  },
  post_index: async (req, res) => {
    let _email = req.body.email
    let item = await Subscribe.where({email: _email}).fetch()
    if (!item) {
      await Subscribe.forge({
        email: _email
      }).save()
    }
    res.send({status: true})
  }
}
