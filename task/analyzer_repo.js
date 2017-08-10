const LibRepo = require('../lib/repo')

// 计算 Quality
let quality = async (url) => {
  let result = await LibRepo.fetch(url)
  console.log(result)
}

quality('vuejs/vue-loader')
