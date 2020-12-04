module.exports = {
	service:{
		mode: process.env.NODE_ENV || "development", // production (heroku NODE_ENV variable) or development
		port: process.env.PORT || 3000,
		host: process.env.HOST || "localhost:3000",
		publicDir:"./.public"
	},

  ner_servers: {
    "en": process.env.NER_URL_EN || "localhost:3001",
    "ru": process.env.NER_URL_RU || "localhost:3002",
    "uk": process.env.NER_URL_UK || "localhost:3003"
  }
}
