const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
const config = require('./../config');
//const redis = require('./../services/redis');

class DayModel{
 constructor(){
   this.prefix = 'day';
   this.collection = db.collection(this.prefix);

   //redis commands as cache functions
  /* this.getKeyFromCache = promisify(redis.hget).bind(redis);
   this.setKeyToCache = promisify(redis.hset).bind(redis);
   this.getCache = promisify(redis.get).bind(redis);
   this.setCache = promisify(redis.set).bind(redis);
 //	this.getHash = promisify(redis.hgetall).bind(redis);; */
 }

 /*
   @params - dayObject - day account info
   Description: adds new day to database
 */
 async setDay(dayObject){
   if(!dayObject){
     return false;
   }
   try{
     await this.collection.insertOne(dayObject);
     return true;
   }catch(e){
     console.error('ERROR, failed to add day, ' + e);
     return false;
   }
 }
 /*
   @params - dayID - id of day for updating
   @params - dayObject - day account info
   Description: update day account info
 */
 async update(dayID,dayObject){
   if(!dayObject){
     console.error('ERROR, failed to update day, dayObject null');
     return false;
   }

   try{
     await this.collection
     .updateOne({ _id : new ObjectID(dayID) },{ $set : dayObject }, {upsert: true});
     return true;

   }catch(e){
     console.error('ERROR, failed to update day, ' + e);
     return false;
   }
 }
 /*
   @params - date - id of day for query
   Description: get day info
 */
 async getDay(date){
   if(!date){
     return false;
   }

   try{
     const result = await this.collection
     .find({ date : date })
     .toArray();

     if(result.length == 0){
       return false;
     }
     return result[0];
     //await this.setCache(key,JSON.stringify(day));
    // return date;

   }catch(e){
     console.error('ERROR, failed to get day, ' + e);
     return false;
   }
 }

}

module.exports = new DayModel();
