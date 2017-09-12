const request = require('request')
const localEnv = require('../../config.json')

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

// 获取文件列表
let contents = url => {
  const githubAPI = `https://api.github.com/repos/${url}/contents?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
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

// 获取readme
let fetchReadme = (reponame) => {
  const readmeUrl = `https://api.github.com/repos/${reponame}/readme?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
  return new Promise(resolve => {
    request({
      url: readmeUrl,
      headers: {
        'User-Agent': 'Awesomes',
        'accept': 'application/vnd.github.VERSION.raw'
      }
    }, (error, response, body) => {
      resolve(body)
    })
  })
}

// 获取语言
let fetchLanguages = (reponame) => {
  const url = `https://api.github.com/repos/${reponame}/languages?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
  return new Promise(resolve => {
    request({
      url: url,
      headers: {
        'User-Agent': 'Awesomes'
      }
    }, (error, response, body) => {
      resolve(JSON.parse(body))
    })
  })
}

// graphql 接口
let graphqlQuery = (query) => {
  const readmeUrl = `https://api.github.com/graphql`
  return new Promise(resolve => {
    request({
      method: 'POST',
      url: readmeUrl,
      body: JSON.stringify({query: `query ${query}`
      }),
      headers: {
        'User-Agent': 'Awesomes',
        'content-type': 'application/json',
        'Authorization': `bearer ${localEnv.github.pa_token}`
      }
    }, (error, response, body) => {
      resolve(JSON.parse(body))
    })
  })
}

module.exports = {
  fetch: fetchRepo,
  fetchReadme: fetchReadme,
  fetchLanguages: fetchLanguages,
  contents: contents,
  graphqlQuery: graphqlQuery
}
