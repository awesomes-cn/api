// 创建定时任务到系统

require('crontab').load((err, crontab) => {
  crontab.reset()
  crontab.create(`node ${__dirname}/sync_repo_attr.js`, '0 1 * * *')
  crontab.create(`node ${__dirname}/sync_repo_trend.js`, '0 5 * * *')
  crontab.save((err, crontab) => {
    console.log('写入定时任务成功')
  })
})
