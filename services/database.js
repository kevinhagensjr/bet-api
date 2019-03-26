const {MongoClient} = require('mongodb');
const config = require('./../config');

let database = {
	db : null,
	connect : (callback) => {
	    MongoClient.connect(config.mongodb.url, (err, mongodb) => {
	    		if(err){
	    			console.error('Failed to connect to databse', err);
	    			return callback(false);
	    		}
	    		return callback(mongodb);
	    });
  }
};

module.exports = database;
