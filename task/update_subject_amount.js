// 更新专题数量
const Subject = require('../models/subject')

let updateSubjectAmount = async () => {
  let subs = await Subject.fetchAll()
  subs.forEach(async sub => {
    await sub.update_amount()
  })
  console.log('====计算数量成功=======')
}

updateSubjectAmount()
