
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('microblogs', (t) => {
    t.string('screenshot', 100)
  })
}

exports.down = function (knex, Promise) {
}
