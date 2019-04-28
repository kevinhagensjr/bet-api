const config = require('./../../config');
const auth = require('./../../services/auth');
//const RabbitMQ = require('./../../services/rabbitmq');
const relativeDate = require('relative-date');
//const craigslist = require('node-craigslist');
const request = require('request');

class BetController{

	constructor(){
		this.betModel = require('./../../models/bet');
    this.userModel = require('./../../models/user');
		this.notificationModel = require('./../../models/notification');
	}

  async post(req,res){
      const userID = auth.getUserID(req);
			const eventID = req.body.eventID;
			const sportID = req.body.sportID;
			const amount = req.body.amount;
			const date = req.body.date;
			const timestamp = Date.now()
			const opponentID = req.body.opponentID;
			const mascot = req.body.mascot;

			if(!userID){
				return res.json({
					success : false,
					error : 'Account is not valid'
				});
			}

			if(!eventID){
				return res.json({
					success : false,
					error : 'No event selected'
				});
			}

			if(!sportID){
				return res.json({
					success : false,
					error : 'No sport found'
				});
			}

			if(!date){
				return res.json({
					success : false,
					error : 'Date for event not found'
				});
			}

			if(!mascot){
				return res.json({
					success : false,
					error : 'No team mascot found'
				});
			}

			if(!amount || amount < 10){
				return res.json({
					success : false,
					error : 'Bet amount could not be found'
				});
			}

			if(!opponentID){
				return res.json({
					success : false,
					error : 'Could not find friend to bet against'
				});
			}

			const betAdded = await this.betModel({
				userID : userID,
				eventID : eventID,
				sportID : sportID,
				amount : amount,
				timestamp : timestamp,
				date : date
			});

			if(!betAdded){
				return res.json({
					success : false,
					error : 'Failed to place bet'
				});
			}

			const betID = await this.betModel.getBetID(userID,timestamp);
			if(!betID){
				return res.json({
					success : false,
					error : 'Failed to place bet'
				});
			}

			//create notification
			const username = await this.userModel.getName(userID);
			if(username){
					const message = username + ' placed a bet for the ' + mascot;
					await this.notificationModel.setNotification({
						userID : userID,
						type : 'bet',
						message : message,
						details : {
							betID : betID
						},
						timestamp : timestamp
					});

				 const notificationID = await this.notificationModel.findNotification(userID,timestamp);
			}
			return res.json({
				success : true,
				betID : betID
			});
  }



  async bet(req,res){
    const userID = auth.getUserID(req);
    const betID = req.params.betID;

    /*
    if(!saleID){
      return res.json({
        success : false,
        error : 'Sale id is invalid'
      });
    }

    let sale = await this.saleModel.getSale(saleID);
    if(!sale){
      return res.json({
        success : false,
        error : 'Could not find sale'
      });
    }
    sale.username = await this.userModel.getName(sale.userID);
		sale.timestamp = relativeDate(sale.timestamp);
    return res.json(sale); */

    return res.json({
      success : true
    });
  }

	async sales(req,res){
		/*const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}
		console.log('user id: ' + userID);
		let sales = await this.saleModel.getHome();
		console.log('sales ' + JSON.stringify(sales));
		if(!sales){
			return res.json([]);
		}

		const region = await this.userModel.getRegion(userID);
		if(region){
			let craigslistClient = new craigslist.Client({city : region});
			let listings = await craigslistClient.search({
				category : 'gms' //garage sale category
			},'garage sale');

//			console.log('craigslist results: ' + JSON.stringify(listings));

			for(let gs of listings){
				if(!gs.url){
					continue;
				}
				let cls = {
					_id : gs.pid,
					url : gs.url,
					title : gs.location,
					description : gs.title,
					type : 'craigslist',
					timestamp : new Date(gs.date).getTime()
				}

				if(!gs.location){
					cls.title = gs.title;
					cls.description = 'Garage sale found on craigslist';
				}
				sales.push(cls);
			}
		}

		for(let i=0; i < sales.length; i++){
			sales.timestamp = relativeDate(sales.timestamp);
		}

		console.log(JSON.stringify(sales));

		return res.json(sales); */
    return res.json({
      success : true
    });
	}


  async remove(req,res){
    const userID = auth.getUserID(req);
    const betID = req.params.betID;

    if(!userID){
      res.json({
        success : false,
        error : 'account is invalid'
      });
    }

		if(!betID){
			res.json({
				success : false,
				error : 'bet id is invalid'
			});
		}

    const removed = await this.betModel.remove(betID);
    if(!removed){
      return res.json({
        success : false,
        error : 'Failed to remove bet'
      });
    }

    return res.json({
      success : true
    });
  }
	async update(req,res){
    /*
  	const userID = auth.getUserID(req);
		const title = req.body.title;
		const description = req.body.description;

		if(!userID){
			return res.json({
				success : false,
				error : 'Account is not valid'
			});
		}

		if(!title){
			return res.json({
				success : false,
				error : 'Story does not have title'
			});
		}

		if(!description){
			description = "";
		}

		let saleObject = {
			title : title,
			description : description
		};

		const updated = this.saleModel.update(saleID,saleObject);
		if(!updated){
			return res.json({
				success : false,
				error : 'Failed to update sale'
			});
		} */
		return res.json({
			success : true
		});
	}


}

module.exports = new BetController();
