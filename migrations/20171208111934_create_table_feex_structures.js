
exports.up = function (knex, Promise) {
  return knex.schema.createTableIfNotExists('feex_structures', function (table) {
    table.increments()
    table.integer('feex_id')
    table.string('name')
    table.string('type') // 文件 file  文件夹  folder
    table.string('file_from') // 文件来源 数据库 file   上传 upload
    table.string('file_upload') // 如果是上传的话，则给定上传文件名
    table.integer('feex_file_id') // 如果是来源于 feex_file 数据库的话，则给定ID
    table.integer('parent').defaultTo(0)
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
}
