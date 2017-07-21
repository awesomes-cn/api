// 获取新的前端库

const Translation = require('../translation')
const RepoHelper = require('../lib/repo')

let fetchRepo = async url => {
  let result = await RepoHelper.fetch(url)
  console.log(result)
}

fetchRepo('http://github.com/emberjs/ember.js')
