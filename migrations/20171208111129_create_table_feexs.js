
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feexs', function (table) {
    table.increments()
    table.integer('mem_id')
    table.string('title') // 标题
    table.string('cover', 150) // 封面图片
    table.string('summary', 300) // 摘要
    table.integer('chapter').defaultTo(0) // 共多少节
    table.float('price').defaultTo(0) // 价格
    table.string('ison').defaultTo('N') // 是否上线
    table.integer('sales').defaultTo(0) // 销量
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
