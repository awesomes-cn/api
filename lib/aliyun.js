var OSS = require('ali-oss')

var localEnv = require('../config')

var client = new OSS.Wrapper({
  region: localEnv.alioss.region,
  accessKeyId: localEnv.alioss.AccessKeyId,
  accessKeySecret: localEnv.alioss.AccessKeySecret
})

var aliyun = {
  // 上传
  upload: async (file, filename) => {
    client.useBucket(localEnv.alioss.bucket)
    return await client.put(filename, file)
  }
}

module.exports = aliyun
