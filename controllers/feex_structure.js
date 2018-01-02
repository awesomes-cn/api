const FeexStructure = require('../models/feex_structure')
const HelperFeexRSP = require('../helper/feex/reset_structure_path')

module.exports = {
  get_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()
    res.send(item)
  },

  delete_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()
    await item.destroy()
    res.send({
      status: true
    })
  },

  put_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()

    ;['id', 'name', 'file_from', 'file_upload', 'feex_file_id', 'parent', 'file_con'].forEach(key => {
      if (req.body[key] !== undefined) {
        item.set(key, req.body[key])
      }
    })
    let resitem = await item.save()
    if (req.body.name !== undefined) {
      await HelperFeexRSP((await FeexStructure.where({
        id: item.id
      }).fetch()).toJSON())
    }

    res.send({
      status: true,
      item: resitem
    })
  }
}
