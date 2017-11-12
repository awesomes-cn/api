const DB = require('../lib/db')
const Repo = require('./repo')
const Mem = require('./mem')
require('./mem')
const Msg = require('./msg')

let Oper = DB.model('Oper', {
  tableName: 'opers',
  hasTimestamps: true,
  repo: function () {
    return this.belongsTo(Repo, 'idcd')
  },
  mem: function () {
    return this.belongsTo('Mem')
  },
  initialize: function () {
    this.on('created', (model) => {
      return Promise.all([Oper.updateTarget(model), Oper.sendNotify(model)])
    })
  }
}, {
  sameAmount: function (params) {
    return Oper.query({where: params}).count('id')
  },
  // 更新目标对象的操作次数
  updateTarget: function (model) {
    let Model = {
      REPO: {
        table: Repo,
        opers: {
          USING: 'using',
          MARK: 'mark'
        }
      },
      COMMENT: {
        table: require('./comment'),
        opers: {
          FAVOR: 'favor'
        }
      },
      NEWS: {
        table: require('./microblog'),
        opers: {
          FAVOR: 'favor'
        }
      },
      DIANP: {
        table: require('./dianp'),
        opers: {
          FAVOR: 'favor'
        }
      },
      TOPIC: require('./topic')
    }[model.get('typ')]

    if (!Model) { return Promise.resolve() }
    let opername = Model.opers[model.get('opertyp')]
    if (!opername) { return Promise.resolve() }
    let table = Model.table
    return new Promise(resolve => {
      Oper.query({where: {opertyp: model.get('opertyp'), typ: model.get('typ'), idcd: model.get('idcd')}}).count().then(count => {
        table.query({where: {id: model.get('idcd')}}).fetch().then(data => {
          data.set(opername, count)
          data.save().then(() => {
            resolve(count)
          })
        })
      })
    })
  },
  maxOrder: async function (params) {
    if (params.opertyp !== 'USING') {
      return Promise.resolve(0)
    }
    let item = await Oper.query({
      where: params,
      limit: 1,
      orderByRaw: '`order` desc'
    }).fetch()
    return item ? item.get('order') : 0
  },
  // 给目标发送通知
  sendNotify: async function (model) {
    let Model = {
      NEWS: {
        table: './microblog',
        name: '情报',
        link: 'news',
        opers: {
          FAVOR: 'favor'
        }
      }
    }[model.get('typ')]
    if (!Model) { return Promise.resolve() }
    let domain = 'main'

    if (Model.link === 'news') {
      domain = 'news'
    }
    let table = require(Model.table)

    let [fromem, distobj] = await Promise.all([
      Mem.query({where: {id: model.get('mem_id')}}).fetch(),
      table.query({where: {id: model.get('idcd')}}).fetch()
    ])

    let toid = distobj.get('mem_id')

    // 目标用户发送通知，如果是给自己的对象则不用通知
    let distids = fromem.id === toid ? [] : [toid]
    await distids.map(async (mem) => {
      await new Msg({
        title: '赞',
        domain: domain,
        con: `[${fromem.get('nc')}](/mem/${fromem.get('id')}) 赞了你的 [${Model.name}](/${Model.link}/${model.get('idcd')})`,
        status: 'UNREAD',
        to: toid,
        typ: 'favor'
      }).save()
    })
  }
})

module.exports = Oper
