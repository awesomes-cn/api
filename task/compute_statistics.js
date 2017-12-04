// 计算统计数据
const Site = require('../models/site')
const Repo = require('../models/repo')
const Oper = require('../models/oper')

let compute = async () => {
  let item = await Site.where({typ: 'statistic'}).fetch()
  if (!item) {
    item = await Site.forge({typ: 'statistic'}).save()
  }

  // repo 总数
  let _repos = await Repo.count('id')

  // 收藏用户数
  let _mems = await Oper.where({
    typ: 'REPO',
    opertyp: 'MARK'
  }).query({
    groupBy: 'mem_id'
  }).count('id')

  // 收藏repo数
  let _marks = await Oper.where({
    typ: 'REPO',
    opertyp: 'MARK'
  }).count('id')

  item.set('sdesc', JSON.stringify({
    repos: _repos,
    mems: _mems,
    marks: _marks
  }))

  await item.save()

  console.log(` [x]更新统计数据成功`)
}

compute()
