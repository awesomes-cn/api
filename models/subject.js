const DB = require('../lib/db')
const Repo = require('./repo')

module.exports = DB.Model.extend({
  tableName: 'subjects',
  hasTimestamps: true,
  repos: [],
  repo: function () {
    return this.belongsTo(Repo)
  },
  update_amount: async function () {
    let _amount = await Repo.where('tag', 'LIKE', `%${this.get('title')}%`).count('id')
    this.set('amount', _amount)
    await this.save()
  }
})
