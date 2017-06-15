const Submit = require('../models/submit')
const localEnv = require('../config')
const request = require('request')
const Repo = require('../models/repo')
const Category = require('../models/category')

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

let fetchRepo = (reponame) => {
  const readmeUrl = `https://api.github.com/repos/${reponame}?client_id=${localEnv.github.client_id}&client_secret=${localEnv.github.client_secret}`
  return new Promise(resolve => {
    request({
      url: readmeUrl,
      headers: {
        'User-Agent': 'Awesomes'
      }
    }, (error, response, body) => {
      resolve(JSON.parse(body))
    })
  })
}

module.exports = {
  post_new: function (req, res) {
    new Submit({
      html_url: req.body.html_url,
      rootyp: req.body.rootyp,
      typcd: req.body.typcd,
      status: 'UNREAD'
    }).save().then(model => {
      res.send({status: true})
    })
  },
  // 提取
  get_fetch: async (req, res) => {
    let _submit = await Submit.where({
      id: req.params.id
    }).fetch()
    let count = await Repo.where({
      html_url: _submit.get('html_url')
    }).count('id')
    if (count > 0) {
      _submit.set('status', 'READED')
      await _submit.save()
      res.send({ status: false })
      return
    }
    let reponame = _submit.get('html_url').split('//github.com/')[1]
    let [root, typ, readme, repodata] = await Promise.all([
      Category.where({
        typcd: 'A',
        key: _submit.get('rootyp')
      }).fetch(),
      Category.where({
        typcd: 'B',
        key: _submit.get('typcd')
      }).fetch(),
      fetchReadme(reponame),
      fetchRepo(reponame)
    ])

    let _homepage = repodata.homepage || ''
    if (_homepage.indexOf('http') !== 0) {
      _homepage = `http://${_homepage}`
    }

    let newRepo = {
      name: repodata.name,
      full_name: repodata.full_name,
      alia: repodata.name.replace('.', '-'),
      html_url: repodata.html_url,
      description: repodata.description,
      homepage: _homepage,
      stargazers_count: repodata.stargazers_count,
      forks_count: repodata.forks_count,
      subscribers_count: repodata.subscribers_count,
      pushed_at: repodata.pushed_at,
      typcd: _submit.get('typcd'),
      typcd_zh: root.get('sdesc'),
      rootyp: _submit.get('rootyp'),
      rootyp_zh: typ.get('sdesc'),
      owner: repodata.owner.login,
      about: readme
    }

    await Repo.forge(newRepo).save()
    _submit.set('status', 'READED')
    await _submit.save()

    res.send({ status: true })
  }
}
