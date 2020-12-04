# Requirements (local use)

npm v.6.13.4
node v.12.16.1

# How to run (local, dev)

npm install
npm run dev

Standard configuration (file config.js)
jace-nlp: localhost:3000
jace-ner services: en = localhost:3001, ru = localhost:3002, uk = localhost:3003

# How to deploy (heroku, via CLI)

1. Create app.
heroku create -a jace-nlp
2. Add buildpacks:
- heroku/nodejs
3. Set host URL.
heroku config:set -a jace-nlp HOST=jace-nlp.herokuapp.com
4. Set jace-ner services' URLs.
heroku config:set -a jace-nlp NER_URL_EN=jace-ner-en.herokuapp.com
heroku config:set -a jace-nlp NER_URL_RU=jace-ner-ru.herokuapp.com
heroku config:set -a jace-nlp NER_URL_UK=jace-ner-uk.herokuapp.com
5. Deploy!
git push https://git.heroku.com/jace-nlp.git HEAD:master
