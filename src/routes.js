const utils = require("./utils")
const send = utils.send
const highlight = utils.highlight

const _ = require("lodash")
const axios = require('axios')

const config = require('../config')
const lang_detection = require('./lang_detection')
const sentence_extractor = require('./sentence_extractor')



module.exports = [
	{	
		method: "get",
		path: "/version",
		handler: (req, res) => {
  

		  Promise.all( _.keys(config.ner_servers).map( lang =>
		      new Promise( (resolve, reject) => {
		        axios.get(config.ner_servers[lang])
		            .then( response => {
		              resolve( _.extend({service: config.ner_servers[lang]}, response.data)) 
		            })
		            .catch( e => {
		              resolve( _.extend({service: config.ner_servers[lang]}, {error:e.toString()}))
		            })
		      })  
		  )).then( responses => send(
		  		req.headers.accept,
		  		{
			        "status": "OK",
			        "data": responses
			    },
			    res	
		  ))

		}
	},

	{	
		method: "post",
		path: "/version",
		handler: (req, res) => {
  

		  Promise.all( _.keys(config.ner_servers).map( lang =>
		      new Promise( (resolve, reject) => {
		        axios.get(config.ner_servers[lang])
		            .then( response => {
		              resolve( _.extend({service: config.ner_servers[lang]}, response.data)) 
		            })
		            .catch( e => {
		              resolve( _.extend({service: config.ner_servers[lang]}, {error:e.toString()}))
		            })
		      })  
		  )).then( responses => send(
		  		req.headers.accept,
		  		{
			        "status": "OK",
			        "data": responses
			    },
			    res	
		  ))

		}
	},

	{
		method:"post",
		path:"/ner/tokenize", 
		handler: (req, res) => {
		  let params = {
		        text: req.body || "",
		        lang: req.query.lang || lang_detection(req.body || "") || "en",
		        offsets: req.query.offsets || false
		  };
		  
		  axios.post(`${config.ner_servers[params.lang]}/ner/tokenize`, params)
			    .then( response => send(
			  		req.headers.accept,
			  		{
				        "status": "OK",
				        "data": response.data
				    },
				    res	
			  	))
			    .catch( error => send(
			  		req.headers.accept,
			  		{
				     "status": "ERROR",
			         "data": error.toString()
			        },
				    res	
			  )) 

		}
	},

	{
		method:"post",
		path:"/ner/extract_entities",
		handler: (req, res) => {
		  
		  let params = {
		        text: req.body || "",
		        lang: req.query.lang || lang_detection(req.body || "") || "en",
		        tags: req.query.tags || "",
		        extract_sentences: req.query.extract_sentences || false 
		  };
		  
		  axios.post(`${config.ner_servers[params.lang]}/ner/extract_entities`, params)
		    .then( response => send(
		  		req.headers.accept,
		  		{
			        "status": "OK",
			        "data": response.data
			    },
			    res	
		  	))
		    .catch( error => send(
		  		req.headers.accept,
		  		{
			     "status": "ERROR",
		         "data": error.toString()
		        },
			    res	
		  	)) 
		    
		    // .then( response => 

		    // {
		    //   let temp = {
		    //     "status": "OK",
		    //     "data": response.data
		    //   };

		    //   if (req.query.extract_sentences == 'true') {
		    //     const promise = sentence_extractor(req.body, JSON.parse(JSON.stringify(response.data.result.named_entities)));
		    //     promise.then(result => {
		    //       response.data.result.extracted_sentences = result;
		    //       return getResponse(req.headers.accept, temp, res);
		    //     })
		    //   } else {
		    //     return getResponse(req.headers.accept, temp, res);
		    //   }
		    //  })
		}
	},

	{
		"method": "post",
		"path": "/ner/highlight",
		handler: (req,res) => {
			
			
			let tokenizeParams = {
			        text: req.body.text || "",
			        htmlTemplate: req.body.htmlTemplate || "",
			        lang: req.query.lang || lang_detection(req.body.text || "") || "en",
			        offsets: req.query.offsets || false
			}
			
			

			let extractParams = {
		        text: req.body.text || "",
		        lang: req.query.lang || lang_detection(req.body.text || "") || "en",
		        tags: req.query.tags || "",
		        extract_sentences: req.query.extract_sentences || false 
			}
			
			axios.post(`${config.ner_servers[tokenizeParams.lang]}/ner/tokenize`, tokenizeParams)
					.then(response => ({ tokens: response.data.result.tokens}))
					.then( data => axios.post(`${config.ner_servers[extractParams.lang]}/ner/extract_entities`, extractParams)
										.then(response => _.extend(data, {entities : response.data.result.named_entities}))
					)
					.then( data => send(
				  		req.headers.accept,
				  		{
					        "status": "OK",
					        "data": highlight(data.entities, data.tokens, req.body.htmlTemplate)
					    },
					    res	
			  		))
			  		.catch( error => send(
				  		req.headers.accept,
				  		{
					     "status": "ERROR",
				         "data": error.toString()
				        },
					    res	
				  	)) 
		}
	},
	{
		method:"get",
		path:"/test",
		handler: (req, res) => {
			let params = {
		        lang: "uk", //req.query.lang || lang_detection(req.body.text || "") || "en",
		        offsets: req.query.offsets || false,
	            tags: req.query.tags || "",
		        extract_sentences: req.query.extract_sentences || false 
			}
			

			requests = [
				{
					text:"У Великій Британії більше половини людей старше 80 років отримали хоча б одну дозу вакцини від коронавірусу, а уряд повідомив, що в країні кожну хвилину роблять 140 щеплень.",
					command:"/ner/extract_entities"
				},

				{
					text:"У Великій Британії більше половини людей старше 80 років отримали хоча б одну дозу вакцини від коронавірусу, а уряд повідомив, що в країні кожну хвилину роблять 140 щеплень.",
					command:"/ner/tokenize"
				},	

				{
					text:"Про це повідомляє Європейська правда з посиланням на Sky News.",
					command:"/ner/extract_entities"
				},
				{
					text:"Про це повідомляє Європейська правда з посиланням на Sky News.",
					command:"/ner/tokenize"
				},
				{
					text:"Тим часом, прем'єр-міністр Борис Джонсон опублікував в Twitter дані Національної служби охорони здоров'я про те, що вакцинація від COVID-19 проводиться зі швидкістю 140 уколів на хвилину.",
					command:"/ner/extract_entities"
				},
				{
					text:"Тим часом, прем'єр-міністр Борис Джонсон опублікував в Twitter дані Національної служби охорони здоров'я про те, що вакцинація від COVID-19 проводиться зі швидкістю 140 уколів на хвилину.",
					command:"/ner/tokenize"
				},
			]
			
			Promise.all(requests.map( r => {
				params.text = r.text
				return axios.post(`${config.ner_servers[params.lang]}${r.command}`, params)
				.then(response => response.data)
				.catch( e => `${config.ner_servers[params.lang]}${r.command} e.toString()`)
			}))
			.then( response => send(
			  		req.headers.accept,
			  		{
				        "status": "OK",
				        "data": response
				    },
				    res	
		  		))
		}
	}	
]


			// Promise.all([
				// axios.post(`${config.ner_servers[tokenizeParams.lang]}/ner/tokenize`, tokenizeParams)
				// 	.then(response => { tokens: response.data.result.tokens})
				// 	.then( data => axios.post(`${config.ner_servers[extractParams.lang]}/ner/extract_entities`, extractParams)
				// 						.then(response => _.extends(data, {entities : response.data.result.named_entities}))
				// 	)
				// 	.then( data => send(
				//   		req.headers.accept,
				//   		{
				// 	        "status": "OK",
				// 	        "data": highlight(data.entities, data.tokens, req.body.htmlTemplate)
				// 	    },
				// 	    res	
			 //  		))					
				// 	//  {
					// 	let tokens = response.data.result.tokens
					// 	return axios.post(`${config.ner_servers[extractParams.lang]}/ner/extract_entities`, extractParams)
					// .then(response => response.data)
					// })
					// // .catch( e => `on ${config.ner_servers[tokenizeParams.lang]}/ner/tokenize ${e.toString()}`)
				// ,
				// axios.post(`${config.ner_servers[extractParams.lang]}/ner/extract_entities`, extractParams)
				// 	.then(response => response.data)
					// .catch( e => `on ${config.ner_servers[tokenizeParams.lang]}/ner/tokenize ${e.toString()}`)
		  	// ])
// .then( response => {
// 		  		let tokens = response[0].result.tokens
// 		  		let entities = response[1].result.named_entities
// 		  		let htmlTemplate = req.body.html
// 		  		console.log(tokens)
// 		  		console.log(entities)
// 		  		return send(
// 			  		req.headers.accept,
// 			  		{
// 				        "status": "OK",
// 				        "data": highlight(entities, tokens, htmlTemplate)
// 				    },
// 				    res	
// 		  		)
// 		  	}) 
		   //  .catch( error => send(
		  	// 	req.headers.accept,
		  	// 	{
			  //    "status": "ERROR",
		   //       "data": error.toString()
		   //      },
			  //   res	
		  	// )) 
// 		}
// 	}	    	

// ]