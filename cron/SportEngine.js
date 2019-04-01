const SportHelper = require('../services/SportHelper');
let database = require('../services/database');

async function run(){
  database.connect(async (db) => {
  	if(!db){
  		console.error('Failed to start sports enginie, cant connect to database');
  		return false;
  	}

  	//create db module
  	database.db = db;
  	console.log('Successfully connected to mongo db, running sports engine');

    const events = await SportHelper.getTodaysEvents();
    if(!events){
      return;
    }

    console.log(events);

  });

}

run();
