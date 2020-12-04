const _ = require('lodash')
const chalk = require('chalk')
const fse = require('fs-extra')
const path = require('path')

let config = _.extend(require('../config'), require('./build.config'))

console.log(`Install Swagger UI Theme "${config.swagger_ui_theme}"`)

fse.copy(
  path.resolve(`./node_modules/swagger-ui-themes/themes/3.x/theme-${config.swagger_ui_theme}.css`),
  path.resolve(`${config.service.publicDir}/sw-theme.css`),
  { overwrite: true})
.then(() => {
  console.log(chalk.green(`Install Swagger UI Theme "${config.swagger_ui_theme}" was successfully installed`));
})
.catch(e => {
  console.log(chalk.red(e.toString()));
});
