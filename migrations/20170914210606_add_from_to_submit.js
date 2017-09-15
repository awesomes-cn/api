
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('submits', (t) => {
    t.string('from').defaultTo('mem')
  })
}

exports.down = function (knex, Promise) {
}
