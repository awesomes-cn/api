// 清理垃圾数据
const Json = require('../models/json')
const moment = require('moment')
// 表：jsons

let clearJsons = async () => {
  let expireDay = moment().add(-2, 'days').format()
  let items = await Json.where('created_at', '<', expireDay).fetchAll()
  let actions = items.map(item => {
    console.log(` [x]清除 ${item.id}`)
    item.destroy()
  })
  await Promise.all(actions)
  console.log(` [x]清除所有过期的 JSON 数据成功`)
  process.exit()
}

clearJsons()
