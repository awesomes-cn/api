const DB = require('../lib/db')
const MemInfo = require('./mem_info')
require('./oper')

module.exports = DB.model('Mem', {
  tableName: 'mems',
  hasTimestamps: true,
  mem_info: function () {
    return this.hasOne(MemInfo)
  },
  opers: function () {
    return this.hasMany('Oper', 'mem_id')
  }
})
