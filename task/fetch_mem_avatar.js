// 同步会员头像到CDN

const Mem = require('../models/mem')
const Aliyun = require('../lib/aliyun')

let fetchAvatars = async () => {
  let mems = await Mem.fetchAll()
  for (let mem of mems) {
    await fetchOne(mem)
  }
}

let fetchOne = mem => {
  return new Promise(resolve => {
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

fetchAvatars()

