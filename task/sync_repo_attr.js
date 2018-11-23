// 同步前端库各项数据

const Repo = require('../models/repo')
const RepoHelper = require('../lib/repo')

let syncRepoTask = id => {
  Repo.where('id', '>', id).fetch().then(async item => {
    if (item) {
      try {
        await RepoHelper.sync(item)
        console.log(`${item.get('full_name')} 同步成功`)
      } catch (ex) {
        console.log(' [x]同步出错了', ex)
      }
      setTimeout(() => {
        syncRepoTask(item.id)
      }, 1200)
    } else {
      process.exit()
    }
  })
}

syncRepoTask(0)
