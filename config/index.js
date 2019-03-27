'use strict';

const serverName  = process.env.NODE_NAME || 'bet-api-1';
const environment = process.env.NODE_ENV  || 'production';

let config = {
	environment : environment.toString(), //set enviornment production vs development
	cdn : 'https://dpr427tvll08r.cloudfront.net/', //cdn for thumbnails and avatars
	server : {
		name : serverName.toString()
	},
	aws : {
		accessKey : 'AKIAI3MBZAAEE4MPSQRQ',
		secretAccessKey : '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' ,
		region : 'us-east-1'
	},
	port : 3001, //api port
	mongodb : {
		url 	 : 'mongodb://127.0.0.1:27017/betdb',
		port 	 : 27017,
		database : 'betdb'
	},
	slack : { //configurations for slack
		username 	: 'betuFood',
		webhook 	: 'https://hooks.slack.com/services/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',
		channels    : {
			user 	 : '#new-user',
			sale 	 : '#new-bet',
			feedback : '#user-feedback',
			signup   : '#signup'
		}
	},
	stripe : {
		key : {
		 	publishable : 'pk_test_HwnlNCbDDF9OyJmGZOrmPGIW00cV7iHjGJ',
			secret : 'sk_test_KXQKq5yXhAzSXqca3EXvju0x00HtSalr1Q'
		}
	}
};

module.exports = config;
