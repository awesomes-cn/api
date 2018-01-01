const FeexStructure = require('../models/feex_structure')

module.exports = {
  get_index_id: async (req, res) => {
    let item = await FeexStructure.where({
      id: req.params.action
    }).fetch()
    res.send(item)
  }
}
