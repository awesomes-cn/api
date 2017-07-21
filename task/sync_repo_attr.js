// 同步前端库各项数据

const Repo = require('../models/repo')
const RepoHelper = require('../lib/repo')

let syncRepoTask = id => {
  Repo.where('id', '>', id).fetch().then(async item => {
    if (item) {
      await RepoHelper.sync(item)
      console.log(`${item.get('full_name')} 同步成功`)
      setTimeout(() => {
        syncRepoTask(item.id)
      }, 1200)
    }
  })
}

syncRepoTask(0)
