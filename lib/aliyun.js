var OSS = require('ali-oss')

var localEnv = require('../config')
const request = require('request')

var client = new OSS.Wrapper({
  region: localEnv.alioss.region,
  accessKeyId: localEnv.alioss.AccessKeyId,
  accessKeySecret: localEnv.alioss.AccessKeySecret
})

var aliyun = {
  // 上传普通文件
  upload: async (file, filename) => {
    client.useBucket(localEnv.alioss.bucket)
    return await client.put(filename, file)
  },

  // 上传网络图片
  uploadUrl: async (url, filename) => {
    var stream = require('stream')
    var a = new stream.PassThrough()
    request.get(url).pipe(a)
    return await aliyun.upload(a, filename)
  }
}

module.exports = aliyun
