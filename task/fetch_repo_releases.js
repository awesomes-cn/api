// 获取最近发布的新版本

const Repo = require('../models/repo')
const RepoHelper = require('../lib/repo')
const Release = require('../models/release')
var DF = require('date-fns')

let aWeekAgo = DF.addWeeks((new Date), -1)
let aMonthAgo = DF.addMonths((new Date), -1)

let fetchOne = async item => {
  await new Promise(reolve => {
    setTimeout(function () {
      reolve()
    }, 1500)
  })
  let data = await RepoHelper.fetchLatestVersion(item)
  if (!data) { return }
  console.log(`start：${item.full_name} : ` + data.published_at)
  if (DF.isBefore(DF.parse(data.published_at), aWeekAgo)) {
    return
  }
  let _old = await Release.query({
    orderByRaw: 'id desc',
    where: {
      repo_id: item.id,
      tag_name: data.tag_name
    }
  }).fetch()
  if (!_old) { return }
  await Release.forge({
    repo_id: item.id,
    tag_name: data.tag_name,
    published_at: data.published_at,
    body: data.body
  }).save()
  console.log(`--------成功写入：${item.full_name} - ${data.tag_name}`)
}

let fetchRepoReleases = async () => {
  let _repos = await Repo.where('stargazers_count', '>', 1000).where('pushed_at', '>', aMonthAgo).fetchAll()
  _repos = _repos.toJSON()
  console.log(`有 ${_repos.length} 个前端库需要处理`)
  for (let repo of _repos) {
    await fetchOne(repo)
  }
}

fetchRepoReleases()
