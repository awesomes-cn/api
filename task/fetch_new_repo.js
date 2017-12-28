// 获取新的前端库

const Submit = require('../models/submit')
const RepoHelper = require('../lib/repo')
const SubmitHelper = require('../lib/submit')
const DF = require('date-fns')
let monthsAgo = DF.addMonths((new Date), -3)

// 提取多少个
var amount = 3

// 是否满足条件
let isAllow = async (repoData, submit) => {
  if (submit.get('from') === 'trend') {
    return true
  }

  // start 数 > 10000
  let cond1 = repoData.stargazers_count >= 1000
  if (!cond1) { return false }

  // 最近更新时间 3个月
  let cond2 = DF.isAfter(DF.parse(repoData.pushed_at), monthsAgo)
  if (!cond2) { return false }

  // 语言限制
  let languages = await RepoHelper.fetchLanguages(repoData.full_name)
  let keys = []
  for (let k in languages) {
    keys.push(k)
  }
  let cond3 = ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'Sass', 'Vue'].indexOf(keys[0]) > -1

  return cond3
}

let fetchRepo = async id => {
  let _submit = await Submit.where('id', '<', id).where({status: 'UNREAD'}).query({
    orderByRaw: 'id desc',
    limit: 1
  }).fetch()
  if (!_submit) { return }
  console.log('====', _submit.reponame())
  let repoData = await RepoHelper.fetch(_submit.reponame())
  let _isAllow = await isAllow(repoData, _submit)
  if (_isAllow) {
    let result = await SubmitHelper.fetch(_submit.id, repoData, true)
    if (result) {
      amount--
      console.log('成功提取', _submit.reponame())
    } else {
      console.log('不满足要求', _submit.reponame())
    }
  } else {
    console.log('不满足要求', _submit.reponame())
  }
  if (amount > 0) {
    setTimeout(() => {
      fetchRepo(_submit.id)
    }, 1200)
  }
}

fetchRepo(100000000)
