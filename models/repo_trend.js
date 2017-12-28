const DB = require('../lib/db')

module.exports = DB.Model.extend({
  tableName: 'repo_trends',
  hasTimestamps: true
})
