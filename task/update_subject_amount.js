// 更新专题数量
const Subject = require('../models/subject')

let updateSubjectAmount = async () => {
  let subs = await Subject.fetchAll()
  subs = subs.toJSON()
  for (let sub of subs) {
    await sub.update_amount()
  }
  console.log('====计算数量成功=======')
  process.exit()
}

updateSubjectAmount()
