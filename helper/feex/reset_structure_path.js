const FeexStructure = require('../../models/feex_structure')
// 计算文件路径
let resetStructurePath = async (feex, parent) => {
  let parentID = feex.parent
  let base = ''
  if (!parent && parentID !== 0) {
    parent = await FeexStructure.where({
      id: parentID
    }).fetch()
  }
  if (parent) {
    base = parent ? `${parent.get('path')}/` : ''
  }
  let _path = `${base}${feex.name}`
  await FeexStructure.forge({
    id: feex.id,
    path: _path
  }).save()

  if (feex.type === 'folder') {
    let childs = await FeexStructure.where({
      parent: feex.id
    }).fetchAll()
    childs = childs.toJSON()
    let actions = childs.map(item => {
      resetStructurePath(item)
    })
    await Promise.all(actions)
  }
}

module.exports = resetStructurePath
