// 前端库搜索 Index
const algoliasearch = require('algoliasearch')
const localEnv = require('../config.json')
const Repo = require('../models/repo')

let client = algoliasearch(localEnv.algolia.appId, localEnv.algolia.adminKey)
let index = client.initIndex('Repo')

let searchIndex = async () => {
  let repos = await Repo.fetchAll()
  let objects = repos.map(repo => {
    let item = {objectID: repo.id}
    ;['name', 'description', 'description_cn', 'tag', 'hidetags', 'typcd', 'typcd_zh', 'rootyp', 'rootyp_zh', 'stargazers_count'].forEach(key => {
      item[key] = repo.get(key)
    })
    return item
  })
  index.addObjects(objects, (err, content) => {
    console.log(err, content)
    process.exit()
  })
}

searchIndex()
