const aliyun = require('../lib/aliyun')
const path = require('path')

module.exports = {
  // 上传
  post_index: (req, res) => {
    // if (!res.locals.mid) {
    //   res.send({status: false})
    //   return
    // }
    let bodydata = {}
    if (req.busboy) {
      req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {
        bodydata[key] = value
      })
      req.busboy.on('file', async function (fieldname, file, filename, encoding, mimetype) {
        let distName = `${bodydata.folder}/${Date.now()}-${res.locals.mid}-${parseInt(Math.random() * 10000)}${path.extname(bodydata.filepath)}`
        await aliyun.upload(file, distName)
        res.send({
          filename: path.basename(distName)
        })
      })
      req.pipe(req.busboy)
    }
  }
}
