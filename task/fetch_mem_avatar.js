// 同步会员头像到CDN

const Mem = require('../models/mem')
const Aliyun = require('../lib/aliyun')

let fetchOne = mem => {
  return new Promise(resolve => {
    if (!/^http[s]?:\/\//.test(mem.avatar)) {
      resolve()
      return
    }
    setTimeout(async () => {
      let _filename = `${Date.now()}-${mem.id}-${parseInt(Math.random() * 10000)}.png`
      console.log(mem.avatar, `mem/${_filename}`)
      await Aliyun.uploadUrl(mem.avatar, `mem/${_filename}`)
      mem.avatar = _filename
      await Mem.forge(mem).save()
      console.log(`同步${mem.id}头像成功：${_filename}`)
      resolve()
    }, 1000)
  })
}

let fetchAvatars = async () => {
  let mems = await Mem.fetchAll()
  mems = mems.toJSON()
  for (let mem of mems) {
    await fetchOne(mem)
  }
}

fetchAvatars()

