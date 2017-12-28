const request = require('request')

let fetchReadme = () => {
  const readmeUrl = `https://api.github.com/graphql`
  return new Promise(resolve => {
    request({
      method: 'POST',
      url: readmeUrl,
      body: JSON.stringify({query: `query
        {
          repository(owner: "awesomes-cn", name: "new-awesomes") {
            name 
          }
        }`
      }),
      headers: {
        'User-Agent': 'Awesomes',
        'content-type': 'application/json',
        'Authorization': 'bearer a997877ac707ac012114a2d0ded08eff6acddb01'
      }
    }, (error, response, body) => {
      console.log(JSON.parse(body))
      resolve(JSON.parse(body))
    })
  })
}

fetchReadme()
