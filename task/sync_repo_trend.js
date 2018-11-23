// 计算前端库的趋势

const Repo = require('../models/repo')
const RepoTrend = require('../models/repo_trend')

let nowDay = new Date()
let todayStr = `${nowDay.getFullYear()}-${nowDay.getMonth() + 1}-${nowDay.getDate()}`

// 计算时间差
let dayDiff = prevDate => {
  let todayM = (new Date(todayStr)).getTime()
  let prevM = (new Date(prevDate)).getTime()
  return (todayM - prevM) / (1000 * 60 * 60 * 24)
}

// 计算趋势
let computeTrend = async reoItem => {
  let _today = await RepoTrend.where({
    date: todayStr,
    repo_id: reoItem.id
  }).fetch()
  if (!_today) {
    _today = await RepoTrend.forge({
      date: todayStr,
      repo_id: reoItem.id
    }).save()
  }
  let _overall = reoItem.get('stargazers_count') + reoItem.get('forks_count') + reoItem.get('subscribers_count')
  _today.set('overall', _overall)
  _today = await _today.save()

  let _latests = await RepoTrend.where({
    repo_id: reoItem.id
  }).query({
    orderByRaw: 'id desc',
    limit: 5
  }).fetchAll()
  _latests = _latests.toJSON()
  let _prev = _latests[1]
  let _trend = _prev ? (_overall - _prev.overall) / dayDiff(_prev.date) : 0

  _today.set('trend', _trend)
  await _today.save()

  let _latestTrends = _latests.map(item => {
    return item.trend
  })
  let _latestTrend = 0
  if (_latestTrends.length > 0) {
    _latestTrend = _latestTrends.reduce((result, item) => {
      return item + result
    }, 0) * 1.00 / _latestTrends.length
  }

  reoItem.set('trend', _latestTrend)
  await reoItem.save()
}

let syncRepoTrend = id => {
  Repo.where('id', '>', id).fetch().then(async item => {
    if (item) {
      await computeTrend(item)
      console.log(`${item.get('full_name')} 同步趋势成功`)
      setTimeout(() => {
        syncRepoTrend(item.id)
      }, 500)
    } else {
      process.exit()
    }
  })
}

syncRepoTrend(0)
