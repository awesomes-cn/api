const DB = require('../lib/db')

module.exports = DB.model('FeexSaleLog', {
  tableName: 'feex_sale_logs',
  hasTimestamps: true
})
