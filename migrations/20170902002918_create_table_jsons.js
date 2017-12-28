exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('jsons', function (table) {
    table.increments()
    table.string('key', 100)
    table.text('con')
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {}
