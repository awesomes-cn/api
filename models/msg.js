const DB = require('../lib/db')

module.exports = DB.Model.extend({
  tableName: 'msgs',
  hasTimestamps: true,
  repos: []
})
