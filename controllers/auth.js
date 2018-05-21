const request = require('request')
const config = require('../config')
const Mauth = require('../models/mauth')
const Mem = require('../models/mem')
const MemInfo = require('../models/mem_info')
const jwt = require('jsonwebtoken')

module.exports = {
  get_login: (req, res) => {
    res.redirect(`http://github.com/login/oauth/authorize?client_id=${config.github.client_id}&redirect_uri=${config.github.redirect_uri}&state=${parseInt(Math.random() * 10000)}`)
  },

  get_return: async (req, res) => {
    let webReturn = `https://www.awesomes.cn/auth?token=`
    let token = await new Promise(resolve => {
      request({
        method: 'POST',
        url: 'https://github.com/login/oauth/access_token',
        headers: {
          'Accept': 'application/json'
        },
        form: {
          client_id: config.github.client_id,
          client_secret: config.github.client_secret,
          code: req.query.code,
          redirect_uri: config.github.redirect_uri,
          state: req.query.state
        }
      }, (error, response, body) => {
        resolve(JSON.parse(body).access_token)
      })
    })
    let uerUrl = `https://api.github.com/user?access_token=${token}`
    let userInfo = await new Promise(resolve => {
      request({
        method: 'GET',
        url: uerUrl,
        headers: {
          'User-Agent': 'Awesomes'
        }
      }, (error, response, body) => {
        resolve(body)
      })
    })
    userInfo = JSON.parse(userInfo)
    let _mauth = await Mauth.where({
      provider: 'github',
      uid: userInfo.id
    }).fetch()

    let loginToken
    // 登录
    if (_mauth) {
      loginToken = jwt.sign({ id: _mauth.get('mem_id') }, config.jwtkey, { expiresIn: '5h' })
      res.redirect(`${webReturn}${loginToken}`)
      return
    }

    // 绑定
    if (res.locals.mid) {
      await _mauth.forge({
        provider: 'github',
        uid: userInfo.id,
        mem_id: res.locals.mid
      }).save()
      let memInfo = await MemInfo.where({
        mem_id: res.locals.mid
      }).fetch()
      MemInfo.forge({id: memInfo.id}).save({
        html_url: userInfo.html_url,
        followers: userInfo.followers,
        following: userInfo.following,
        github: userInfo.login,
        blog: memInfo.get('blog') || userInfo.blog,
        location: memInfo.get('blog') || userInfo.location
      })
      loginToken = jwt.sign({ id: res.locals.mid }, config.jwtkey, { expiresIn: '5h' })
      res.redirect(`${webReturn}${loginToken}`)
      return
    }

    // 注册
    let newMem = await Mem.forge({
      nc: userInfo.login,
      email: userInfo.email,
      avatar: userInfo.avatar_url,
      reputation: userInfo.followers
    }).save()

    await MemInfo.forge({
      mem_id: newMem.id,
      location: userInfo.location,
      html_url: userInfo.html_url,
      blog: userInfo.blog,
      followers: userInfo.followers,
      following: userInfo.following,
      github: userInfo.login
    }).save()

    await Mauth.forge({
      provider: 'github',
      uid: userInfo.id,
      mem_id: newMem.id
    }).save()

    loginToken = jwt.sign({ id: newMem.id }, config.jwtkey, { expiresIn: '5h' })
    res.redirect(`${webReturn}${loginToken}`)
    return
  },

  post_session: async (req, res) => {
    let memID = await new Promise(resolve => {
      jwt.verify(req.body.token, config.jwtkey, (err, payload) => {
        if (err) {
          resolve(null)
        } else {
          resolve((payload || {}).id)
        }
      })
    })
    Mem.where({id: memID}).fetch().then(data => {
      if (data) {
        let token = jwt.sign({ id: data.id }, config.jwtkey, { expiresIn: '5h' })
        res.send({
          status: true,
          token: token,
          mem: {
            id: data.id,
            nc: data.get('nc'),
            avatar: data.get('avatar'),
            iswebker: data.get('iswebker')
          }
        })
      } else {
        res.send({status: false})
      }
    })
  },

  post_wxsp: async (req, res) => {
    let _code = req.body.code
    let _info = req.body.info
    let _url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wxsp.appid}&secret=${config.wxsp.appsecret}&js_code=${_code}&grant_type=authorization_code`
    request({
      method: 'GET',
      url: _url,
      headers: {
        'Accept': 'application/json'
      }
    }, async (error, response, body) => {
      let _openid = JSON.parse(body).openid
      let _mauth = await Mauth.where({
        provider: 'wxsp',
        uid: _openid
      }).fetch()
      if (!_mauth) {
        // 注册
        let newMem = await Mem.forge({
          nc: _info.nickName,
          avatar: _info.avatarUrl
        }).save()

        await MemInfo.forge({
          mem_id: newMem.id,
          location: `${_info.country} ${_info.city}`,
          gender: _info.gender === 1 ? 'M' : 'F'
        }).save()

        _mauth = await Mauth.forge({
          provider: 'wxsp',
          uid: _openid,
          mem_id: newMem.id
        }).save()
      }

      let loginToken = jwt.sign({ id: _mauth.get('mem_id') }, config.jwtkey, { expiresIn: '24h' })
      res.send({
        token: loginToken
      })
    })
  }
}
