const Submit = require('../models/submit')
const Auth = require('../middleware/auth')
const SubmitHelper = require('../lib/submit')

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
    await Auth.isAdmin(req, res)
    let result = await SubmitHelper.fetch(req.query.id)
    res.send({ status: result })
  }
}
