const config = require('../config');
const request = require('request');

class SportHelper{
  constructor(){
    this.rundownUrl = 'https://therundown-therundown-v1.p.rapidapi.com';
    this.date = this.getDate();
  }
  getHeaders(){
    return {
      headers : {
        'X-RapidAPI-Key' : config.rapid.key
      }
    };
  }

  getDate(){
    var d = new Date();
    return [
      d.getFullYear(),
      ('0' + (d.getMonth() + 1)).slice(-2),
      ('0' + d.getDate()).slice(-2)
    ].join('-');
  }
  async getSports(){
    return new Promise((resolve,reject)=>{
      const url = this.rundownUrl + '/sports';
      request(url,this.getHeaders,function (error, response, body) {
          if(error || response.statusCode != 200){
            console.log('status code: ' + response.statusCode + ' get sports error: ' + error );
            resolve(false);
          }
          resolve(JSON.parse(body));
      });
    });
  }
  async getTodaysEvents(){
    let sports = await this.getSports();
    if(!sports){
      return false;
    }

    for(let i = 0; i < sports.length; i++){
      let events = await this.getEventsBySport(sports[i]['sport_id']);
      if(!events){
        continue;
      }
      sports[i]['events'] = events;
    }

    return events;
  }

  async getEventsBySport(sportId){
    return new Promise((resolve,reject)=>{
      const url = this.rundownUrl + '/sports/' + sportId + '/events' + this.date + '?include=all_periods%2C+scores%2C+and%2For+teams';
      request(url,this.getHeaders,function (error, response, body) {
          if(error || response.statusCode != 200){
            console.log('status code: ' + response.statusCode + ' get eventsBySport error: ' + error );
            resolve(false);
          }
          resolve(JSON.parse(body));
      });
    });
  }
}

module.exports = new SportHelper();
