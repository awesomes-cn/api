const Release = require('./models/release')

async function  say() {
    let _old = await Release.where({
      repo_id: 24,
      tag_name: 'v3.3.0'
    }).fetch()
}

say()