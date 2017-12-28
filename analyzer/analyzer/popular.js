// 项目的流行度

module.exports = (repoData) => {
  // star fork watch 总数
  let starCount = ['stargazers_count', 'subscribers_count', 'forks_count'].reduce((result, key) => {
    return result + repoData.info[key]
  }, 0)

  let starScore = Math.min((starCount * 1.00 / 5000), 1)
  console.log(' [✔] star：', starScore)

  // 参与用户数量
  let memuserCount = repoData.sumdata.repository.mentionableUsers.totalCount
  let memScore = Math.min(memuserCount * 1.00 / 20, 1)
  console.log(' [✔] 参与用户：', memScore)

  // commits 数量

  // 作者知名度

  // issue 数量
  let issueOpenCount = repoData.info.open_issues
  let issueTotalCount = repoData.sumdata.repository.issues.totalCount
  let issueCount = (issueTotalCount - issueOpenCount) * 1.00 / (issueTotalCount > 0 ? issueTotalCount : 1)
  issueCount = Math.min(issueCount / 0.8, 1)
  let issuePer = Math.min(issueTotalCount * 1.00 / 100, 1)
  let issueScore = issueCount * issuePer
  console.log(' [✔] issue：', issueScore)

  // release 数量
  let releaseCount = repoData.sumdata.repository.releases.totalCount
  let releaseScore = Math.min((releaseCount * 1.00 / 20, 1))
  console.log(' [✔] 发布版本：', releaseScore)

  let data = starScore * 0.4 +
    issueScore * 0.2 +
    releaseScore * 0.2 +
    memScore * 0.2
  return data
}
