// 更新频率

// 时间差（天）
let timeDiff = (time) => {
  let ms = Date.now() - Date.parse(time)
  return parseInt(ms / 1000 / 60 / 60 / 24)
}

let action = (repoData) => {
  // 最后更新时间
  let pushedAt = repoData.info.pushed_at
  let diffDays = timeDiff(pushedAt)
  let maxDays = 30 * 12
  let updateScore = Math.min(Math.max((maxDays - diffDays), 0) * 1.00 / maxDays, 1)
  console.log(' [✔] 更新时间：', updateScore)

  // star 新增数 trend
  let trend = repoData.repo.trend
  let trendScore = Math.min((trend * 1.00 / 20), 1)
  console.log(' [✔] star trend：', trendScore)

  // issue 解决效率
  let data = updateScore * 0.5 +
  trendScore * 0.5
  return data
}

module.exports = action

// action({
//   info: {
//     updated_at: '2016-07-11T08:55:32Z'
//   }
// })
