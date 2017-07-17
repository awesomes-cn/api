// 同步会员头像到CDN

const Mem = require('../models/mem')
const Aliyun = require('../lib/aliyun')

let fetchOne = mem => {
  return new Promise(resolve => {
    if (!/^http[s]?:\/\//.test(mem.avatar)) {
      resolve()
      return
    }
    let _filename = `${Date.now()}-${mem.id}-${parseInt(Math.random() * 10000)}.png`
    console.log(`开始获取${mem.id}：${mem.avatar}`)
    try {
      setTimeout(async () => {
        await Aliyun.uploadUrl(mem.avatar, `mem/${_filename}`)
        mem.avatar = _filename
        await Mem.forge(mem).save()
        console.log(`  > 获取成功${mem.id}：${_filename}`)
        resolve()
      }, 1000)
    } catch (e) {
      console.log(`**【失败】${mem.id}`)
      resolve()
    }
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

