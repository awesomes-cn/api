// 项目的质量

const DL = require('../helper/detect-linters')
let fileVal = (contents, filename) => {
  let _file = contents.find(item => {
    return item.name.toLocaleLowerCase() === filename
  })
  if (!_file) { return 0 }
  return 1
}

module.exports = (repoData) => {
  // Readme 文件得分
  let readmeScore = fileVal(repoData.contents, 'readme.md')

  // gitignore 文件得分
  let ignoreScore = fileVal(repoData.contents, '.gitignore')

  // license 文件得分
  let licenseScore = fileVal(repoData.contents, 'license')

  // linter 得分
  let linterScore = DL(repoData.contents)

  // 主页 得分
  let homePageScore = repoData.info.homepage ? 1 : 0

  let score = licenseScore * 0.33 +
    readmeScore * 0.18 +
    linterScore * 0.13 +
    ignoreScore * 0.16 +
    homePageScore * 0.2
  return score
}
