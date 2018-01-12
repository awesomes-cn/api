const redis = require('redis')
const client = redis.createClient()

let Cache = {
  // expire 过期时间：秒
  set: (key, val, expire) => {
    client.set(key, JSON.stringify(val), 'EX', expire)
  },

  get: (key) => {
    return new Promise(resolve => {
      client.get(key, (err, reply) => {
        resolve(reply)
      })
    })
  },

  ensure: async (key, expire, action) => {
    let result = await Cache.get(key)
    if (result) {
      return JSON.parse(result)
    } else {
      let aresult = await action()
      Cache.set(key, aresult, expire)
      return aresult
    }
  }
}

module.exports = Cache
