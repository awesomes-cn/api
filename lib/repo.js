const request = require('request')
const localEnv = require('../config.json')

// 获取 repo 信息
let fetchRepo = url => {
  const githubAPI = `https://api.github.com/repos/${url}?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
  return new Promise(resolve => {
    request({
      url: githubAPI,
      headers: {
        'User-Agent': 'Awesomes'
      }
    }, (error, response, body) => {
      resolve(JSON.parse(body))
    })
  })
}

// 同步 Repo
let syncRepo = async item => {
  let result = await fetchRepo(item.get('full_name'))
  let keyMaps = {
    stargazers_count: 'stargazers_count',
    forks_count: 'forks_count',
    subscribers_count: 'subscribers_count',
    pushed_at: 'pushed_at',
    github_created_at: 'created_at',
    description: 'description'
  }
  for (let key in keyMaps) {
    item.set(key, result[keyMaps[key]])
  }
  await item.save()
}

// 获取某个 Repo 的最新版本
let fetchLatestVersion = async item => {
  const githubAPI = `https://api.github.com/repos/${item.full_name}/releases?state=all&page=1&per_page=1?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
  return new Promise(resolve => {
    request({
      url: githubAPI,
      headers: {
        'User-Agent': 'Awesomes'
      }
    }, (error, response, body) => {
      if (!error) {
        try {
          resolve(JSON.parse(body)[0])
        } catch (ex) {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  })
}

module.exports = {
  fetch: fetchRepo,
  sync: syncRepo,
  fetchLatestVersion: fetchLatestVersion
}
