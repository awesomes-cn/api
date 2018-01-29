const Config = require('../config.json')
var knex = require('knex')({
  client: 'mysql',
  connection: Config.db,
  pool: { min: 0, max: 15 }
})
var bookshelf = require('bookshelf')(knex)
bookshelf.plugin('registry')

module.exports = bookshelf
