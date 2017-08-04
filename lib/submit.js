const Submit = require('../models/submit')
const Repo = require('../models/repo')
const Category = require('../models/category')
const RepoHelper = require('./repo')
const Translation = require('./translation')
const Aliyun = require('./aliyun')

module.exports = {
  fetch: async (submitID, exsistRepoData, isFetchCover) => {
    let _submit = await Submit.where({
      id: submitID
    }).fetch()
    let reponame = _submit.reponame()
    let count = await Repo.where({
      full_name: reponame
    }).count('id')
    if (count > 0) {
      _submit.set('status', 'READED')
      await _submit.save()
      return false
    }
    let [root, typ, readme] = await Promise.all([
      Category.where({
        typcd: 'A',
        key: _submit.get('rootyp')
      }).fetch(),
      Category.where({
        typcd: 'B',
        key: _submit.get('typcd')
      }).fetch(),
      RepoHelper.fetchReadme(reponame)
    ])

    let repodata = exsistRepoData || await RepoHelper.fetch(reponame)

    let _homepage = repodata.homepage || ''
    if (_homepage.indexOf('http') !== 0) {
      _homepage = `http://${_homepage}`
    }

    let _cover
    // 获取预览图
    if (isFetchCover) {
      let _filename = `${Date.now()}-${submitID}-${parseInt(Math.random() * 10000)}.png`
      try {
        let coverUrl = repodata.organization ? repodata.organization.avatar_url : repodata.owner.avatar_url
        await Aliyun.uploadUrl(coverUrl, `repo/${_filename}`)
        _cover = _filename
      } catch (e) {}
    }

    let newRepo = {
      name: repodata.name,
      full_name: repodata.full_name,
      alia: repodata.name.replace('.', '-'),
      html_url: repodata.html_url,
      description: repodata.description,
      description_cn: await Translation(repodata.description),
      homepage: _homepage,
      stargazers_count: repodata.stargazers_count,
      forks_count: repodata.forks_count,
      subscribers_count: repodata.subscribers_count,
      pushed_at: repodata.pushed_at,
      typcd: _submit.get('typcd'),
      typcd_zh: typ ? typ.get('sdesc') : '',
      rootyp: _submit.get('rootyp'),
      rootyp_zh: root ? root.get('sdesc') : '',
      owner: repodata.owner.login,
      about: readme,
      cover: _cover
    }

    await Repo.forge(newRepo).save()
    _submit.set('status', 'READED')
    await _submit.save()
    return true
  }
}
