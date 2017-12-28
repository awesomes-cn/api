const Github = require('./lib/github')
const Score = require('./analyzer/score')

let analyzer = async (repo) => {
  let url = repo.full_name
  console.log(`..开始分析 ${url}`)
  let repoInfo = await Github.fetch(url)
  let repoContents = await Github.contents(url)
  let _graphqlSql = `
    {
      repository(owner: "${url.split('/')[0]}", name: "${url.split('/')[1]}") {
        releases {
          totalCount
        },
        issues {
          totalCount
        },
        mentionableUsers {
          totalCount
        } 
      }
    }
  `
  let sumdata = await Github.graphqlQuery(_graphqlSql)
  let qualityVal = Score.analyse({
    info: repoInfo,
    contents: repoContents,
    repo: repo,
    sumdata: sumdata.data
  })
  qualityVal = Math.floor(qualityVal * 100) / 100
  console.log(` [*] 结果：`, qualityVal)
  return qualityVal
}

// analyzer('vuejs/vue-loader')
// analyzer({
//   full_name: 'jquery/jquery',
//   trend: 2
// })
module.exports = analyzer
