const DB = require('../lib/db')

module.exports = DB.model('FeexCatalog', {
  tableName: 'feex_catalogs',
  hasTimestamps: true
})
