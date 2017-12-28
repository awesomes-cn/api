const DB = require('../lib/db')
const Repo = require('./repo')
module.exports = DB.Model.extend({
  tableName: 'releases',
  hasTimestamps: true,
  repos: [],
  repo: function () {
    return this.belongsTo(Repo)
  }
})
