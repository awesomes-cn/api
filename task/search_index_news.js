// 前端情报的搜索 Index
const algoliasearch = require('algoliasearch')
const localEnv = require('../config.json')
const Microblog = require('../models/microblog')

let client = algoliasearch(localEnv.algolia.appId, localEnv.algolia.adminKey)
let index = client.initIndex('news')

let searchIndex = async () => {
  let newss = await Microblog.fetchAll()
  let objects = newss.map(item => {
    return {
      objectID: item.id,
      con: item.get('con')
    }
  })
  index.addObjects(objects, (err, content) => {
    console.log(err, content)
  })
}

searchIndex()
