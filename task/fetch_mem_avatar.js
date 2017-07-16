// 同步会员头像到CDN

const Mem = require('../models/mem')
const Aliyun = require('../lib/aliyun')

let memAvatarTask = id => {
  Mem.where('id', '>', id).fetch().then(async mem => {
    if (mem) {
      if (/^http[s]?:\/\//.test(mem.get('avatar'))) {
        await new Promise(resolve => {
          setTimeout(async () => {
            let _filename = `${Date.now()}-${mem.id}-${parseInt(Math.random() * 10000)}.png`
            await Aliyun.uploadUrl(mem.get('avatar'), `mem/${_filename}`)
            mem.set('avatar', _filename)
            await mem.save()
            console.log(`同步${mem.id}头像成功：${_filename}`)
            resolve()
          }, 1000)
        })
      }
    }
    memAvatarTask(mem.id)
  })
}

memAvatarTask(0)

