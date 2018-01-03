
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feex_sale_logs', function (table) {
    table.increments()
    table.integer('feex_id')
    table.integer('mem_id')
    table.float('price') // 购买花费
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
