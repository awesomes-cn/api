const crypto = require('crypto')
const request = require('request')
const Config = require('../config')

const appid = Config.BDTranslation.appid
const key = Config.BDTranslation.key

module.exports = words => {
  var salt = (new Date).getTime()
  var from = 'en'
  var to = 'zh'
  var str1 = appid + words + salt + key
  var sign = crypto.createHash('md5').update(str1).digest('hex')
  return new Promise((resolve, reject) => {
    request({
      url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
      qs: {
        q: words,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      }
    }, function (error, response, body) {
      if (error) {
        reject()
      }
      resolve(JSON.parse(body).trans_result[0].dst)
    })
  })
}
