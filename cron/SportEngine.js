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

    const date = SportHelper.getDate();
    const events = await SportHelper.getTodaysEvents();
    if(!events){
      console.log('failed to get events from API');
      return;
    }
    console.log('EVENTS FOR DAY: ' + date);
    console.log(JSON.stringify(events));
    try{
        const dayCollection = db.collection('day');
        const dayObject = {
          date : date,
          sports : events.sports
        };
        const result = await dayCollection
        .find({date : date })
  			.toArray();
  			if(!result || result.length == 0){
  				  await dayCollection.insertOne(dayObject);
  			}else{
            await dayCollection
            .updateOne({ _id : new ObjectID(result[0]['_id'])},{ $set : dayObject }, {upsert: true});
        }
        return;
    }catch(e){
      console.log('failed to save today event into array: ' + JSON.stringify(events));
    }

  });
}

run();
