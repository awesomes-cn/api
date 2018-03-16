
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('repos', (t) => {
    t.string('banner_cover')
  })
}

exports.down = function (knex, Promise) {
}
