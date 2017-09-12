let quality = require('./quality')
let popular = require('./popular')
let update = require('./update')

let analyse = (repoData) => {
  // 项目质量 完整度
  let inteScore = quality(repoData)

  // 流行度
  let popuScore = popular(repoData)

  // 更新度
  let updateScore = update(repoData)

  let starCount = ['stargazers_count', 'subscribers_count', 'forks_count'].reduce((result, key) => {
    return result + repoData.info[key]
  }, 0)

  let quaPecent = 0.2
  let popuPercent = 0.6 * Math.min((starCount * 1.00 / 5000), 1)
  popuPercent = Math.max(popuPercent, 0.4)
  let updatePercent = (1 - popuPercent - quaPecent)

  console.log(' [*] 得分统计 ', `质量：${inteScore}  流行度：${popuScore} 更新：${updateScore}`)
  return inteScore * quaPecent +
    popuScore * popuPercent +
    updateScore * updatePercent
}
module.exports = {
  analyse: analyse
}
