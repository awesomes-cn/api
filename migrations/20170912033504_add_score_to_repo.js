
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('repos', (t) => {
    t.integer('score').defaultTo(0)
  })
}

exports.down = function (knex, Promise) {
}
