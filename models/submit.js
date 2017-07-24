const DB = require('../lib/db')

module.exports = DB.Model.extend({
  tableName: 'submits',
  hasTimestamps: true,
  reponame: function () {
    let arr = this.get('html_url').split('/')
    return `${arr[3]}/${arr[4]}`
  }
})
