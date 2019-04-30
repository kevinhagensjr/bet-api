const {db} = require('./../services/database');
const {ObjectID} = require('mongodb');
const {promisify} = require('util');
const config = require('./../config');
//const redis = require('./../services/redis');

class FriendModel{
 constructor(){
   this.prefix = 'friend';
   this.collection = db.collection(this.prefix);

   //redis commands as cache functions
  /* this.getKeyFromCache = promisify(redis.hget).bind(redis);
   this.setKeyToCache = promisify(redis.hset).bind(redis);
   this.getCache = promisify(redis.get).bind(redis);
   this.setCache = promisify(redis.set).bind(redis);
 //	this.getHash = promisify(redis.hgetall).bind(redis);; */
 }

 /*
   @params - friendObject - user account info
   Description: adds new user to database
 */
 async setFriends(friendObject){
   if(!friendObject){
     return false;
   }
   try{
     await this.collection.insertOne(friendObject);
     return true;
   }catch(e){
     console.error('ERROR, failed to add friendship, ' + e);
     return false;
   }
 }
 /*
   @params - userID - id of user for updating
   @params - friendObject - user account info
   Description: update user account info
 */
 async update(friendID,friendsObject){
   if(!friendObject){
     console.error('ERROR, failed to update user, friendObject null');
     return false;
   }

   try{
     await this.collection
     .updateOne({ _id : new ObjectID(userID) },{ $set : friendObject }, {upsert: true});
     return true;

   }catch(e){
     console.error('ERROR, failed to update user, ' + e);
     return false;
   }
 }

 async getFriends(userID){
   if(!userID){
     return false;
   }

   try{
     const result = await this.collection
     .find({userID : userID})
     .project({password : 0})
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
   @param - email - email used for checking
   Description: check to see if email exists
 */
 async friendExists(userID,friendID){
   if(!userID || !friendID){
     return false;
   }
   return await this.collection.count({userID : userID, friendID : friendID});
 }

 /*
   @param - email - email used for checking
   Description: check to see if email exists
 */
 async friendsActive(userID,friendID){
   if(!userID || !friendID){
     return false;
   }
   return await this.collection.count({userID : userID, friendID : friendID, status : true});
 }

}

module.exports = new UserModel();
