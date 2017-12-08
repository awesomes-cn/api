
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feex_catalogs', function (table) {
    table.increments()
    table.integer('feex_id')
    table.string('title')
    table.integer('parent').defaultTo(0)
    table.integer('feex_file_id')
    table.string('isfree').defaultTo('N')
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
