
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('msgs', (t) => {
    t.string('domain', 5).defaultTo('main')
  })
}

exports.down = function (knex, Promise) {
}
