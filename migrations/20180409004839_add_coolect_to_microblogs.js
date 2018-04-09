
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('microblogs', (t) => {
    t.integer('collect').defaultTo(0)
  })
}

exports.down = function (knex, Promise) {
}
