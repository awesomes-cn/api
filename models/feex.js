const DB = require('../lib/db')
require('./feex_catalog')

module.exports = DB.Model.extend({
  tableName: 'feexs',
  hasTimestamps: true,
  catalogs: function () {
    return this.hasMany('FeexCatalog', 'feex_id')
  }
})
