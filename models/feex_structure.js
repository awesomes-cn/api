const DB = require('../lib/db')

module.exports = DB.model('FeexStructure', {
  tableName: 'feex_structures',
  hasTimestamps: true
})
