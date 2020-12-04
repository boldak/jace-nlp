const LanguageDetect = require('languagedetect')

const lngDetector = new LanguageDetect();

const aliases = {'english' : 'en', 'russian' : 'ru', 'ukrainian' : 'uk'};

module.exports = (text) => {
  const result = lngDetector.detect(text);

  for (let i = 0; i < result.length; i++) {
    const lang = result[i];
    if (lang[0] in aliases) {
      return aliases[lang[0]];
    }
  }
  return 'en';
}
