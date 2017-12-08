
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feexs', function (table) {
    table.increments()
    table.integer('mem_id')
    table.string('title')
    table.integer('price').defaultTo(0) // 价格
    table.string('ison').defaultTo('N') // 是否上线
    table.integer('sales').defaultTo(0) // 销量
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
