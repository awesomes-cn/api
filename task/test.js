const fs = require('fs')

console.log('====')
fs.writeFileSync(`${__dirname}/demo.txt`, `===${Date.now()}\r\n`)
