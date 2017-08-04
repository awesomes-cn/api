/** 修正 repo 中的 typcd_zh 和 rootyp_zh
 */

const Repo = require('../models/repo')
const Category = require('../models/category')

let start = async () => {
  let cates = await Category.fetchAll()
  cates = cates.toJSON()
  let repos = await Repo.fetchAll({
    select: ['id', 'typcd', 'rootyp']
  })
  repos = repos.toJSON()
  for (let repo of repos) {
    let rootypZh = (cates.find(item => {
      return item.typcd === 'A' && item.key === repo.rootyp
    }) || {}).sdesc
    let typcdZh = (cates.find(item => {
      return item.typcd === 'B' && item.key === repo.typcd
    }) || {}).sdesc
    await Repo.forge({
      id: repo.id,
      rootyp_zh: rootypZh,
      typcd_zh: typcdZh
    }).save()
    console.log(repo.full_name, rootypZh, typcdZh)
  }
}

start()
