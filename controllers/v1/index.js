const config = require('./../../config');
const auth = require('./../../services/auth');
//const RabbitMQ = require('./../../services/rabbitmq');
const stripe = require("stripe")(config.stripe.key.secret);
const slack = require('./../../services/slack');
const relativeDate = require('relative-date');
const request = require('request');
const SportHelper = require('./../../services/SportHelper');
const moment = require('moment');

class IndexController{
	constructor(){
		this.userModel = require('./../../models/user');
		this.dayModel = require('./../../models/day');
	}

	async feed(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error   : 'could not verify user'
			});
		}

		let feed = {
			sports : []
		};
		let sports = await this.dayModel.getDay(SportHelper.getDate());
		for(let i =0; i < sports['sports'].length; i++){

			if(sports['sports'][i]['sport_name'] == 'NFL' || sports['sports'][i]['sport_name'] == 'NBA' || sports['sports'][i]['sport_name'] == 'MLB'){
				if(sports['sports'][i]['events']['events'].length == 0){
					continue;
				}
				for(let x =0; x < sports['sports'][i]['events']['events'].length; x++){
					sports['sports'][i]['events']['events'][x]['teams_normalized'][0]['logo'] = config.cdn + 'logos/' + sports['sports'][i]['events']['events'][x]['teams_normalized'][0]['mascot'].toLowerCase().replace(' ' , '') + '.gif';
					sports['sports'][i]['events']['events'][x]['teams_normalized'][1]['logo'] = config.cdn + 'logos/' + sports['sports'][i]['events']['events'][x]['teams_normalized'][1]['mascot'].toLowerCase().replace(' ' , '') + '.gif';

					if(sports['sports'][i]['events']['events'][x]['teams_normalized'][0]['logo'].includes('cardinals') && sports['sports'][i]['sport_name'] == 'MLB'){
						sports['sports'][i]['events']['events'][x]['teams_normalized'][0]['logo'] = sports['sports'][i]['events']['events'][x]['teams_normalized'][0]['logo'].replace('cardinals','cardinalsbb');
					}
					if(sports['sports'][i]['events']['events'][x]['teams_normalized'][1]['logo'].includes('cardinals') && sports['sports'][i]['sport_name'] == 'MLB'){
						sports['sports'][i]['events']['events'][x]['teams_normalized'][1]['logo'] = sports['sports'][i]['events']['events'][x]['teams_normalized'][1]['logo'].replace('cardinals','cardinalsbb');
					}

					var datetime = moment(sports['sports'][i]['events']['events'][x]['event_date']).format("ddd, hA a");
					sports['sports'][i]['events']['events'][x]['event_date'] = datetime;
				}

				feed['sports'].push(sports['sports'][i]);
			}

		}

		console.log(JSON.stringify(feed));

		return res.json(feed);
	}

	/*
		@param - req - express req object
		@param - res - express res object
		Description: add new user app, grant api access
	*/
	async beta(req,res){
		const name = req.body.name;
		const email = req.body.email;
		const phone = req.body.phone;

		if(!name){
			return res.json({
				success : false,
				error   : 'Must have full name'
			});
		}

		if(!email){
			return res.json({
				success : false,
				error   : 'Must have a valid email'
			});
		}

		const betaObject = {
			name : name,
			email : email
		};

		if(phone){
			betaObject.phone = phone;
		}

		//add to beta list
		const emailExists = await this.betaModel.emailExists(email);
		if(!emailExists){
			await this.betaModel.add(betaObject);
		}

		//send to background job
	/*	const rabbitMQ = new RabbitMQ();
		const brokerConnected = await rabbitMQ.connect();
		if(brokerConnected){
			rabbitMQ.startJob({
				name : name,
				email : email,
				job : 'beta'
			});
		} */

		//notify slack
	//	slack.sendBetaMessage(betaObject);

		return res.json({
			success		: true
		});
	}

	/*
		@param - req - express req object
		@param - res - express res object
		Description: add new user app, grant api access
	*/
	async signup(req,res){
		let username = req.body.username;
		const password = req.body.password;
		const email    = req.body.email;
		const photo    = req.body.photo;
		const deviceType  = req.body.device || 'iOS';
		const deviceToken = req.body.token;

		//check password
		if(!password || password.length < 5 ){
			return res.json({
				success : false,
				error   : 'Password must be at least 5 characters'
			});
		}

		//check email
		if(!this.isEmail(email)){
			return res.json({
				success : false,
				error   : 'Email is not real'
			});
		}

		//check to see if email exists
		const emailExists = await this.userModel.emailExists(email);
		if(emailExists){
			return res.json({
				success : false,
				error   : 'Email is already taken'
			});
		}

		//check photo key
		if(!photo || !photo.includes('.jpg')){
			// add default photo
		}

		//get signed url for photo
		const photoUrl =  config.cdn + photo;

		//encrypt user password
		const encryptedPassword = auth.encrypt(password);

		//create array to hold devices for multiple logins
		let deviceList = [];
		if(deviceToken){
			deviceList.push({
				token : deviceToken,
				type  : deviceType
			});
		}

		let userObject = {
			username : username,
			password : encryptedPassword,
			email    : email,
			photo    : photoUrl,
			devices  : deviceList
		};

		//add new user
		const accountCreated = await this.userModel.setUser(userObject);

		//failed to add account
		if(!accountCreated){
			return res.json({
				success : false,
				error   : 'Sorry, could not create account'
			});
		}
		//get user info and send back
		const userID = await this.userModel.getUserID(email);
		if(!userID){
			return res.json({
				success : false,
				error   : 'Sorry, could not create account'
			});
		}

		//get username
		username = await this.userModel.getName(userID);

		//get API token
		const token = auth.generateToken(userID);
		//send to background job
		/*const rabbitMQ = new RabbitMQ();
		const brokerConnected = await rabbitMQ.connect();
		if(brokerConnected){
			rabbitMQ.startJob({
				job : 'signup'
			});
		}
		//notify via slack
		slack.sendUserMessage(username,email); */
		return res.json({
			success		: true,
			userID	: userID,
			apiToken	: token,
			username	: username
		});
	}

		async facebookSignin(req,res){
				console.log('twitter login: ' + JSON.stringify(req.body));
		}


	async facebookSignin(req,res){
		const facebookID = req.body.facebookID;
		const deviceToken = req.body.token;
		const deviceType  = req.body.device || 'iOS';
		const photo = req.body.photo;
		const email = req.body.email;
		let username = req.body.username;
		let isNewAccount = false;

		if(!facebookID){
			return res.json({
				success : false,
				error : "Could not verify facebook account"
			});
		}

		if(!username){
			return res.json({
				success : false,
				error : "Must have username for facebook account"
			});
		}

		let userID = null;
		let deviceList = [];
		const user = await this.userModel.getUserFromFacebook(facebookID);
		if(!user){
			isNewAccount = true;
			username = username.replace(/\s/g, ''); //remove spaces
			let usernameAvailable = false;
			let usernameCounter = 1;
			while (usernameAvailable == false) {
				const usernameExists = await this.userModel.usernameExists(username);
				if(usernameExists){
					username += usernameCounter++;
				}else{
					usernameAvailable = true;
				}
			}

			//check email
			if(!this.isEmail(email)){
				return res.json({
					success : false,
					error   : 'Email is not real'
				});
			}

			//check to see if email exists
			const emailExists = await this.userModel.emailExists(email);
			if(emailExists){
				return res.json({
					success : false,
					error   : 'Email is already taken'
				});
			}

			//get signed url for photo
			const photoUrl =  config.cdn + photo;

			//create array to hold devices for multiple login
			if(deviceToken){
				deviceList.push({
					token : deviceToken,
					type  : deviceType
				});
			}
			//add new user
			const accountCreated = await this.userModel.setUser({
				username : req.body.username,
				photo    : photoUrl,
				devices  : deviceList,
				email : email,
				facebookID, facebookID
			});

			//failed to add account
			if(!accountCreated){
				return res.json({
					success : false,
					error   : 'Sorry, could not create account'
				});
			}
			//get user info and send back
			const newUser = await this.userModel.getUserFromFacebook(facebookID);
			if(!newUser){
				return res.json({
					success : false,
					error   : 'Sorry, could not create account'
				});
			}
			userID = newUser._id;
			username = newUser.username;
		}else{
			username = user.username;
			userID = user._id;
			if(deviceToken){
				deviceList = await this.userModel.getDevices(userID);
				let deviceExists = false;

				//make sure devices is not already added
				for(let device of deviceList){
					if(device.token == deviceToken){
						deviceExists = true;
						break;
					}
				}
				//add new device
				if(!deviceExists){
					deviceList.push({
						token : deviceToken,
						type  : deviceType
					});
					await this.userModel.update(userID,{
						devices : deviceList
					});
				}
			}
		}

		//get API token
		const token = auth.generateToken(userID);
		return res.json({
			success		: true,
			userID		: userID,
			apiToken	: token,
			username	: username,
			email : email,
			signup : isNewAccount
		});

	}

	async signin(req,res){
	  const email 		= req.body.email;
		const password 		= req.body.password;
		const deviceType   	= req.body.device || 'iOS';
		const deviceToken   = false; //req.body.token;

		const errorResponse = {
			success : false,
			error   : 'username or passowrd is incorrect'
		};

		//check username
		if(!email || email.length < 3){
			return res.json(errorResponse);
		}

		//check password
		if(!password || password.length < 5 ){
			return res.json(errorResponse);
		}

		const userID = await this.userModel.getUserID(email);
		if(!userID){
			return res.json(errorResponse);
		}

		//check is password is good
		const hash = await this.userModel.getPassword(userID);
		if(!auth.passwordIsGood(password,hash)){
			return res.json(errorResponse);
		}
		if(deviceToken){
			let userDevices = await this.userModel.getDevices(userID);
			let deviceExists = false;

			//make sure devices is not already added
			for(let device of userDevices){
				if(device.token == deviceToken){
					deviceExists = true;
					break;
				}
			}
			//add new device
			if(!deviceExists){
				userDevices.push({
					token : deviceToken,
					type  : deviceType
				});
				await this.userModel.update(userID,{
					devices : userDevices
				});
			}
		}
		//get API token
		const token = auth.generateToken(userID);
		return res.json({
			success		: true,
			userID		: userID,
			apiToken	: token
		});
	}


	async signout(req,res){
		const userID = auth.getUserID(req);
		const deviceToken = req.body.token;
		if(!userID){
			return res.json({
				success : false,
				error   : 'user id is invalid'
			});
		}

		//remove device from device list
		if(deviceToken){
			let userDevices = await this.userModel.getDevices(userID);
			for(let i = 0; i < userDevices.length; i++){
				let token = userDevices[i].token;
				if(token == deviceToken){
					userDevices.splice(i, 1);
					break;
				}
			}

			//update database with change
			await this.userModel.update(userID,{
				devices : userDevices
			});
		}
		return res.json({
			success : true
		});
	}

	async search(req,res){
		const userID = auth.getUserID(req);
		const search = req.body.search;

		if(!userID){
			return res.json([]);
		}
		if(!search || search.length < 2){
			return res.json([]);
		}

		const searchArray = await this.userModel.search(search);
		return res.json(searchArray);
	}

	isEmail(email) {
    	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

}

module.exports = new IndexController();
