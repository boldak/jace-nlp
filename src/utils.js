const convert = require('xml-js')
const _ = require("lodash")


let defaltHtmlTemplate = `
<span style="class="mx-1 px-1 font-weight-bold secondary--text entity-wrapper">
        <span style="
            border: 2px solid;
            border-radius: 5px;
            font-size: 0.6em;
            font-weight: 900;
            padding: 0em 0.5em;
            margin: 0em 0.5em 0.1em 0.5em;
            background: white;
            vertical-align: middle;
            display: inline-block;
            line-height: 1.2;
        " class="entity-label entity-type-\$\{entity.tag\}">
            \$\{entity.tag\}
        </span>
        <span class="entiti-value-\$\{entity.tag\}">
            \$\{entity.match\}
        </span>
    </span>
`


let wrapEntity = (entity, match, htmlTemplate) => {
	entity.match = match
    return _.template(htmlTemplate || defaltHtmlTemplate)({entity})
} 


let highlight = (entities, tokens, htmlTemplate) => {
    let serie = []
    let pos = 0
    
    entities.forEach( e => {
        if (pos >= e.range.start){
                serie.push(e)
            } else {
                serie.push({
                    range:{
                        start: pos,
                        end: e.range.start-1
                    }
                })
                serie.push(e)
            }
            pos = e.range.end+1
    })
        
    if( pos < tokens.length-1) serie.push({
        range: {
            start: pos,
            end: tokens.length-1
        }
    })
    
    return serie.map( s =>
        ( 
            (s.tag) 
                ? wrapEntity(s, s.entity, htmlTemplate) 
                : tokens.slice(s.range.start,s.range.end+1).join(" ")
        )).join(" ")
}

module.exports = {
	send: (accept, data, response) => {
		  if (accept == 'application/json') {
		    return response.json(data);
		  } else if (accept == 'application/xml') {
		    let parsed = JSON.parse(JSON.stringify(data));
		    var options = {compact: true, ignoreComment: true, spaces: 4};
		    let parsed_xml = convert.json2xml(parsed, options);
		    response.type('text/xml');
		    return res.send(parsed_xml);
		  }
	},
	
	availableRoutesString: app => app._router.stack
								    .filter(r => r.route)
								    .map(r => Object.keys(r.route.methods)[0].toUpperCase().padEnd(7) + r.route.path)
								    .join("\n  "),

	highlight							    
}