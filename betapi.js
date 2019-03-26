const express = require('express');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const config = require('./config');
let database = require('./services/database');
const cors = require('cors');

class BetAPI{

	constructor() {
		console.log("API initializing, server name: " + config.server.name);
		this.running = false;
		try{
			console.log("Setting up express configurations");
			//initialize express
			this.api = express();
			this.api.use(bodyParser.urlencoded({ extended:false }))
			this.api.use(bodyParser.json());
			this.api.use(cors({
				origin : true,
				methods : ['POST','GET', 'PUT']
			}));

			console.log("Setting up router configurations");

			//initialize router
			this.routes = require('./routes')(this.api);

		}catch(e){
			console.log("Failed to initialize API, " + e);
		}
	}

	start(){
		//listen for api calls
		this.api.listen(config.port, function () {
			console.log('API ready. Listening for api calls on port ' + config.port);
			this.running = true;
		});
	}
}

database.connect((db) => {
	if(!db){
		console.error('Failed to start api, cant connect to database');
		return false;
	}

	//create db module
	database.db = db;
	console.log('Successfully connected to mongo db..loading API');

	//start bet api
	const betAPI = new BetAPI();
	betAPI.start();
});
