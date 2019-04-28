const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
//const redis = require('./../services/redis');
const config = require('./../config');

class BetModel{

	constructor(){
    this.prefix = 'bet';
    this.collection = db.collection(this.prefix);

    //redis commands as cache functions
  /*  this.getKeyFromCache = promisify(redis.hget).bind(redis);
    this.setKeyToCache = promisify(redis.hset).bind(redis);
    this.getCache = promisify(redis.get).bind(redis);
    this.setCache = promisify(redis.set).bind(redis);
		this.pullStack = promisify(redis.lrange).bind(redis);
		this.pushStack = promisify(redis.lpush).bind(redis); */

	}

	async setBet(betObject){
		if(!betObject){
			return false;
		}
		try{
			await this.collection.insertOne(betObject);
      return true;
		}catch(e){
			debug('ERROR, failed to add bet, ' + e);
			return false;
		}
	}

	/*
		@params - betID - id of bet for retreival
		Description : get bet
	*/
	async getBet(betID){
		if(!betID){
			return false;
		}

	/*	let bet = await this.getCache(this.prefx + '_' + betID);
		if(bet && bet.length > 0){
			return JSON.parse(bet);
		} */

		try{
			const result = await this.collection
			.find({_id : new ObjectID(betID.toString())})
			.toArray();
			if(!result || result.length == 0){
				return false;
			}
			let bet = result[0];
		//	await this.setCache(this.prefx + '_' + betID,JSON.stringify(bet));
			return bet;

		}catch(e){
			debug('ERROR: Failed to get bet from database, ' + e);
			return false;
		}
	}
	async getUserBets(userID){
		if(!userID){
			return false;
		}
		//convert to mongo object ids
		try{
			const result = await this.collection
			.find({userID : userID})
			.sort({timestamp : -1})
			.toArray();

			if(!result || result.length == 0){
				return false;
			}
			return result;
		}catch(e){
			return false;
		}
}

  /*
    @params - betID - id of bet for updating
    @params - betObject - bet data
    Description: update bet
  */
  async update(betID,betObject){
    if(!betObject){
      return false;
    }

    try{
      await this.collection
      .updateOne({ _id : new ObjectID(betID)},{ $set : betObject }, {upsert: true});
      return true;

    }catch(e){
      debug('ERROR, failed to add bet, ' + e);
      return false;
    }
  }

	async remove(betID){
		if(!betID){
			return false;
		}
		try{
			await this.collection.deleteOne({_id : new ObjectID(betID)});
			return true;
		}catch(e){
			debug('ERROR: failed to delete bet: ' + betID + ', error: ' + e);
			return false;
		}
	}

  /*
    @param - userID - id of user who made bet
    @param - timestamp - time the bet was made
    Description: get betID from user info
  */
  async getBetID(userID,timestamp){
		if(!userID || !timestamp){
			return false;
		}

		try{
			const result = await this.collection
      .find({userID : userID,timestamp : timestamp})
      .project({ _id : 1 })
      .toArray();

      if(result.length == 0){
        return false;
      }
			return result[0]._id;

		}catch(e){
			debug('ERROR, failed to get bet id, ' + e);
			return false;
		}
	}

  /*
    @param - betID - id of the bet
    Description: get user who made bet
  */
  async getUserID(betID){
      if(!betID){
        return false;
      }

      let userID = false;//await this.getKeyFromCache(this.prefx + betID,'userID');
      if(userID && userID.length > 0){
        return userID;
      }

      try{
        const result = await this.collection
        .find({ _id : new ObjectID(betID.toString())})
        .project({_id : 0, userID : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        userID = result[0].userID;
        //this.setKeyToCache(this.prefix + betID,'userID',userID);

        return userID;

      }catch(e){
        return false;
      }
  }
  /*
    @param - betID - id of the bet
    Description: get title of the bet
  */
  async getTitle(betID){
      if(!betID){
        return false;
      }

      let title = false;//await this.getKeyFromCache(this.prefx + betID,'title');
      if(title && title.length > 0){
        return title;
      }

      try{
        const result = await this.collection
        .find({ _id : betID})
        .project({ _id : 0, title : 1 })
        .toArray();

        if(result.length == 0){
          return false;
        }

        title = result[0].title;
        //this.setKeyToCache(this.prefx + betID,'title',title);

        return title;

      }catch(e){
        return false;
      }
  }


  /*
    @param - betID - id of the bet
    Description: get text from bet
  */
  async getDescription(betID){
      if(!betID){
        return false;
      }

      let description = false;//await this.getKeyFromCache(this.prefx + betID,'description');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(betID)})
        .project({_id : 0, description : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        description = result[0].description;
        //this.setKeyToCache(this.prefx + betID,'description',description);

        return description;

      }catch(e){
        return false;
      }
  }


  /*
    @param - betID - id of the bet
    Description: get thumbnail from bet
  */
  async getThumbnails(betID){
      if(!betID){
        return false;
      }

      let thumbnails = false;//await this.getKeyFromCache(this.prefx + betID,'thumbnails');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(betID)})
        .project({_id : 0, thumbnails : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        thumbnails = result[0].thumbnails;
        //this.setKeyToCache(this.prefx + betID,'thumbnails',thumbnails);

        return thumbnails;

      }catch(e){
        return false;
      }
  }

  /*
    @param - betID - id of the bet
    Description: get timestamp from bet
  */
  async getTimestamp(betID){
      if(!betID){
        return false;
      }

      let timestamp = false;//await this.getKeyFromCache(this.prefx + betID,'timestamp');

      try{
        const result = await this.collection
        .find({_id : new ObjectID(betID)})
        .project({_id : 0, timestamp : 1})
        .toArray();

        if(result.length == 0){
          return false;
        }

        timestamp = result[0].timestamp;
        //this.setKeyToCache(this.prefx + betID,'timestamp',timestamp);

        return timestamp;

      }catch(e){
        return false;
      }
  }

	async search(search){
		if(!search){
			return [];
		}
		try{
			const result = await this.collection
			.find({title : {$regex : search.toString(),$options: 'i'}})
			.toArray();

			if(!result || result.length == 0){
				return [];
			}
			return result;
		}catch(e){
			debug('ERROR: Failed to search for bet');
			return [];
		}
	}


}

module.exports = new BetModel();
