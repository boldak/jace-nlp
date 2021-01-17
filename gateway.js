const bodyParser = require('body-parser')
const CORS = require('cors')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')

const config = require('./config')

const app = express();

app.use(CORS());
app.use(express.static(config.service.publicDir));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require("./src/routes").forEach( route => {
  app[route.method](route.path, route.handler)
})


let swaggerDocument = YAML.load('./jace-ner-api.yaml');
swaggerDocument.info.title = "Jace NLP Service";
swaggerDocument.info.description = "Provides API for Named Entity Recognition on different languages";
swaggerDocument.host = config.service.host
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument,{customCssUrl:"sw-theme.css"}));


console.log("Gateway config:\n", JSON.stringify(config, null," "))
console.log(JSON.stringify(swaggerDocument, null, " "))

console.log("Available routes:\n", require("./src/utils").availableRoutesString(app))

app.listen(config.service.port, () => {
  console.log(`Gateway service starts on port ${config.service.port} in ${config.service.mode} mode.`);
});
