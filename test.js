const Translation = require('./lib/translation')

let say = async () => {
  let w = await Translation('sheet')
  console.log(w)
}

say()