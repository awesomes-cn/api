const Release = require('./models/release')

let action = async () => {
  let item = await Release.forge({
    repo_id: 1,
    tag_name: '',
    published_at: '2019-02-12T17:10:38Z',
    body: ''
  }).save()
  console.log('===', item.id)
}

action()
