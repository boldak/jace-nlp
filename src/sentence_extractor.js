let extractSentences = require('sentence-extractor').extractSentences

function iterate(item, named_entities) {
    if (item.type == 'word' && named_entities.length > 0 && named_entities[0].entity.startsWith(item.value)) {
      let named_entity;
      if (item.value == named_entities[0].entity) {
        named_entity = named_entities.shift();
      } else {
        named_entity = named_entities[0];
        // TODO support more complicate cases than whitespaces
        named_entity.entity = named_entity.entity.substr(named_entity.entity.indexOf(" ") + 1);
      }
      item.type = `named entity (${named_entity.tag})`;
    }

    Array.isArray(item.childs) && item.childs.forEach(item => iterate(item, named_entities));
}

module.exports = (text, named_entities) => {
  return extractSentences(text)
      .then( res => {
          let res_json = [res];
          res_json.forEach(item => iterate(item, named_entities));
          return res_json;
      })
      .catch( e => {
          console.error(e.toString())
      });
}
