// 获取 GitHub trending 数据
const request = require('request')
const Submit = require('../models/submit')
const Repo = require('../models/repo')

let fetchData = (language) => {
  let url = `https://github.com/trending/${language}`
  return new Promise(resolve => {
    request({
      url: url,
      headers: {
        'User-Agent': 'Awesomes'
      }
    }, (error, response, body) => {
      resolve(body)
    })
  })
}

let processData = async (fullname) => {
  console.log(` [..] 处理 ${fullname}`)
  let htmlUrl = `https://github.com/${fullname}`
  let hasRepo = await Repo.where({html_url: htmlUrl}).fetch()
  if (hasRepo) {
    console.log(` [x] 已重复 Repo`)
    return
  }
  let hasSubmit = await Submit.where({html_url: htmlUrl}).fetch()
  if (hasSubmit) {
    hasSubmit.set('from', 'trend')
    await hasSubmit.save()
    console.log(` [x] 已重复 Submit`)
    return
  }
  await Submit.forge({
    html_url: htmlUrl,
    rootyp: 'Applications',
    typcd: 'Utilities',
    from: 'trend'
  }).save()
  console.log(` [✓] 获取成功`)
}

let fetchGithubTrend = async language => {
  console.log(` [=====] 开始获取 ${language} Trend 数据`)
  let body = await fetchData(language)
  var result
  let matchs = []
  var patt = new RegExp(/<a\s+href="\/(\w+\/[\w-\.]+)">/, 'g')
  while ((result = patt.exec(body)) != null) {
    matchs.push(result[1])
  }
  for (let item of matchs) {
    await processData(item)
  }
  console.log(' [✓] 全部数据处理完毕')
}

let action = async () => {
  await fetchGithubTrend('css')
  await fetchGithubTrend('vue')
  await fetchGithubTrend('javascript')
  process.exit()
}

action()
