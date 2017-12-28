module.exports = {
  get_test: (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(`
    <!doctype html>
    <html>
      <head>
        <!-- CSS 和 JS 外链 -->
      <link href="css/main.css" rel="stylesheet">
      </head>
    
      <body>
    
        <!-- JS 调用 -->
        <script>window.document.domain = "192.168.26.128"</script>
      </body>
    </html>
    `)
  }
}
