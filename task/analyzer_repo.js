const analyzer = require('../analyzer/index')
const Repo = require('../models/repo')

let action = async (repoID) => {
  let _repo = await Repo.where('id', '>', repoID).fetch()
  if (!_repo) {
    process.exit()
    return
  }

  // 偶数
  let day = new Date().getDate()
  if ((_repo.id - day) % 2 === 0) {
    try {
      let score = await analyzer(_repo.toJSON())
      _repo.set('score', score * 100)
      await _repo.save()
    } catch (ex) {
      console.log(' [x] 分析失败')
    }
  }

  setTimeout(() => {
    action(_repo.id)
  }, 3000)
}

action(0)
