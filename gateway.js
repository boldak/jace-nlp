const bodyParser = require('body-parser')
const CORS = require('cors')
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const axios = require('axios')
const xml = require('xml')
const convert = require('xml-js')

const config = require('./config')
const lang_detection = require('./src/lang_detection')
const sentence_extractor = require('./src/sentence_extractor')

const app = express();
app.use(CORS());
app.use(express.static(config.service.publicDir));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function getResponse(accept, obj, res) {
  if (accept == 'application/json') {
    return res.json(obj);
  } else if (accept == 'application/xml') {
    let parsed = JSON.parse(JSON.stringify(obj));
    var options = {compact: true, ignoreComment: true, spaces: 4};
    let parsed_xml = convert.json2xml(parsed, options);
    res.type('text/xml');
    return res.send(parsed_xml);
  }
}

app.get("/version", (req, res) => {
  console.log('in /version');
  console.log(config.ner_servers);
  var p = [];
  console.log(req.protocol);
  for (let key in config.ner_servers){
      const server_address = config.ner_servers[key];
      console.log(server_address);
      let promise = axios.get(req.protocol + '://' + server_address + '/version').then(function (response) { return response.data; }).catch(function (error) {});
      p.push(promise);
  }
  Promise.all(p).then(values => {
    let temp = {
      "status": "OK",
      "data": values
    }

    return getResponse(req.headers.accept, temp, res);
  });
});

app.post("/ner/tokenize", (req, res) => {
  let params = {
        text: req.body,
        lang: req.query.lang,
        offsets: req.query.offsets
  };
  if (params.lang == undefined) {
    params.lang = lang_detection(params.text);
  }
  if (params.offsets == undefined) {
    params.offsets = false;
  }
  const server_address = config.ner_servers[params.lang];
  axios.post(req.protocol + '://' + server_address + '/ner/tokenize', params)
  .then(function (response) {
     let temp = {
       "status": "OK",
       "data": response.data
     };
     return getResponse(req.headers.accept, temp, res);
   })
   .catch(function (error) {
     let temp = {
       "status": "ERROR",
       "data": error
     }
      return getResponse(req.headers.accept, temp, res);
   });
});

app.post("/ner/extract_entities", (req, res) => {
  let params = {
        text: req.body,
        lang: req.query.lang,
        tags: req.query.tags
  };
  if (params.lang == undefined) {
    params.lang = lang_detection(params.text);
  }
  if (params.tags == undefined) {
    params.tags = ''
  }
  const server_address = config.ner_servers[params.lang];
  axios.post(req.protocol + '://' + server_address + '/ner/extract_entities', params)
  .then(function (response) {
    let temp = {
      "status": "OK",
      "data": response.data
    };

    if (req.query.extract_sentences == 'true') {
      const promise = sentence_extractor(req.body, JSON.parse(JSON.stringify(response.data.result.named_entities)));
      promise.then(result => {
        response.data.result.extracted_sentences = result;
        return getResponse(req.headers.accept, temp, res);
      })
    } else {
      return getResponse(req.headers.accept, temp, res);
    }
   })
   .catch(function (error) {
     let temp = {
       "status": "ERROR",
       "data": error
     }
      return getResponse(req.headers.accept, temp, res);    });
});

let swaggerDocument = YAML.load('./jace-ner-api.yaml');
swaggerDocument.info.title = "Jace NLP Service";
swaggerDocument.info.description = "Provides API for Named Entity Recognition on different languages";
swaggerDocument.host = config.service.host
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument,{customCssUrl:"sw-theme.css"}));

app.listen(config.service.port, () => {
  console.log(`Gateway service starts on port ${config.service.port} in ${config.service.mode} mode.`);
});
