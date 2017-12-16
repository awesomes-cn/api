const DB = require('../lib/db')
require('./feex_catalog')
require('./mem')

module.exports = DB.Model.extend({
  tableName: 'feexs',
  hasTimestamps: true,
  catalogs: function () {
    return this.hasMany('FeexCatalog', 'feex_id')
  },
  mem: function () {
    return this.belongsTo('Mem')
  }
})
