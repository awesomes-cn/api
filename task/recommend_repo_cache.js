// 推荐的repo
const Repo = require('../models/repo')
const Cache = require('../lib/cache')

let fetch = async () => {
  // let _query = Repo.where('score', '>', 0)
  let _ids = await Repo.query({
    limit: 1000,
    select: ['id']
  }).fetchAll()
  _ids = _ids.toJSON().map(item => {
    return item.id
  })
  let _data = {
    items: _ids,
    count: _ids.length
  }
  console.log('要缓存的数据条数', _ids.length)
  Cache.set('recommendRepos', _data, 60 * 60 * 12)
  console.log('ok')
}

fetch()
