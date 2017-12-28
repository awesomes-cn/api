const FeexStructure = require('../models/feex_structure')
const path = require('path')
const localEnv = require('../config')

let script = (domain) => {
  return `
  <script>
  window.document.domain = "${domain}"
  window.addEventListener("message", receiveMessage);
  function receiveMessage(event)
  {
    document.write(event.data);
  }
  </script>
  `
}

module.exports = {
  get_feex: (req, res) => {
    let domain = req.hostname.replace(/^\w+\./, '')
    res.set('Content-Type', 'text/html')
    res.send(`
    <!doctype html>
    <html>
      <body>
        ${script(domain)}
      </body>
    </html>
    `)
  },
  get_index: async (req, res) => {
    let _file = req.params[0].replace(/^\//, '')
    let st = await FeexStructure.where({
      feex_id: req.params.id,
      path: _file
    }).fetch()
    if (!st) {
      res.send('')
      return
    }
    if (st.get('file_from') === 'file') {
      let exta = (path.extname(st.get('name')) || '').toLocaleLowerCase()
      let ctype = {
        '.css': 'text/css',
        '.js': 'application/x-javascript'
      }[exta] || ''
      res.set('Content-Type', ctype)
      res.send(st.get('file_con'))
    } else {
      res.redirect(`${localEnv.alioss.baseurl}feex/${st.get('file_upload')}`)
    }
  }
}
