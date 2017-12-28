
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('microblogs', (t) => {
    t.string('picture', 50)
  })
}

exports.down = function (knex, Promise) {
}
