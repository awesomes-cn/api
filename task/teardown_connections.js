const Config = require('../config.json')
var knex = require('knex')({
  client: 'mysql',
  connection: Config.db
})

knex.destroy(function () {
  console.log('断开连接成功！')
})
