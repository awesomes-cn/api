
module.exports = {
  isAdmin: async (req, res) => {
    let memId = res.locals.mid
    if (memId !== 1) {
      res.sendStatus(401)
      res.send('no power')
    }
  }
}
