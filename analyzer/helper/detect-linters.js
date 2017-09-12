module.exports = (files) => {
  let maps = {
    editorconfig: ['.editorconfig'],
    coffeelint: ['.coffeelint.json'],
    csslint: ['.csslintrc'],
    eslint: ['.eslintrc.js', '.eslintrc.yaml', '.eslintrc.yml', '.eslintrc.json', '.eslintrc'],
    htmlhint: ['.htmlhintrc'],
    jscs: ['.jscsrc', '.jscs.json'],
    jshint: ['.jshintrc'],
    stylelint: ['.stylelintrc.js', '.stylelintrc.yaml', '.stylelintrc.json', '.stylelintrc']
  }
  let paths = []
  for (let key in maps) {
    paths = paths.concat(maps[key])
  }
  let _amount = files.reduce((result, item) => {
    if (paths.indexOf(item.name.toLocaleLowerCase()) > -1) {
      result += 1
    }
    return result
  }, 0)
  return _amount > 0 ? 1 : 0
}
