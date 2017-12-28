
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feex_files', function (table) {
    table.increments()
    table.integer('feex_id')
    table.string('name')
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
