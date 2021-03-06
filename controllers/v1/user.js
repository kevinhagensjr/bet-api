const config = require('./../../config');
const auth = require('./../../services/auth');
const request = require('request');

class UserController{
	constructor(){
		this.userModel = require('./../../models/user');
		this.betModel = require('./../../models/bet');
		this.sports = {};
	}

	async profile(req,res){
		const userID = auth.getUserID(req);
		const accountID = req.params.userID;

		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}
		if(!accountID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		let profile = await this.userModel.getUser(accountID.toString());
		if(!profile){
			return res.json({
				success : false,
				error   : 'Could not find user'
			});
		}

		return res.json(profile);
	}


	async account(req,res){
		const userID = auth.getUserID(req);
		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		const user = await this.userModel.getUser(userID);
		if(!user){
			return res.json({
				success : false,
				error   : 'Could not get user information'
			});
		}

		res.json(user);
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: Update the user account info
	*/
	async update(req,res){
		const userID = auth.getUserID(req);
		const username = req.body.username;
		const email    = req.body.email;
		const photo = req.body.photo;
		const stripe = req.body.stripe;

		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

		let userObject = {};
		if(username){
			userObject.username = username;
		}

		if(email){
			const currentEmail = await this.userModel.getEmail(userID);
			//check to see if email has changed
			if(currentEmail != email){
				const emailExists = await this.userModel.emailExists(email);
				if(emailExists){
					return res.json({
						success : false,
						error	: 'Email address is already taken'
					});
				}

				//add new email
				userObject.email = email.toLowerCase();
			}
		}

		if(photo && photo.includes('avatars')){
			userObject.photo = config.cdn + photo;
		}

		if(stripe){
			userObject.stripe = stripe;
		}
		//update the users account
		const updateSuccessful = await this.userModel.update(userID,userObject);
		if(!updateSuccessful){
			return res.json({
				success : false,
				error	: 'Failed to update your account'
			});
		}
		return res.json({
			success : true,
			username : username
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: Change the users password
	*/
	async updatePassword(req,res){

		const userID = auth.getUserID(req);
		const oldPassword = req.body.old;
		const newPassword = req.body.new;

		if(!userID){
			return res.json({
				success : false,
				error   : 'account is invalid'
			});
		}

		if(!oldPassword || !newPassword){
			return res.json({
				success : false,
				error   : 'password must be at least 5 character'
			});
		}

		if(!newPassword.length > 5 && !oldPassword.length > 5){
			return res.json({
				success : false,
				error   : 'Password must be at least 5 characters'
			});
		}

		//get current password
		const hash = await this.userModel.getPassword(userID);
		if(!hash){
			return res.json({
				success : false,
				error   : 'old password is incorrect'
			});
		}

		//check is password is good
		if(!auth.passwordIsGood(oldPassword,hash)){
			return res.json({
				success : false,
				error   : 'old password is incorrect'
			});
		}

		//encrypt new password
		const encryptedPassword = auth.encrypt(newPassword.toString());

		//save new password
		const updateSuccessful = await this.userModel.update(userID,{
			password : encryptedPassword
		});

		if(!updateSuccessful){
			return res.json({
				success : false,
				error   : 'Failed to update password'
			});
		}

		return res.json({
			success : true
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: User has added a new profile picture
	*/
	async addPhoto(req,res){
		const userID = auth.getUserID(req);
		const photo = req.body.photo;

		if(!userID){
			return res.json({
				success : false,
				error   : 'User id is invalid'
			});
		}

		//make sure photo path is uploaded
		if(!photo.includes('.jpg')){
			return res.json({
				success : false,
				error   : 'Photo does not exist'
			});
		}

		const photoURL = config.cdn + photo;
		const updateSuccessful = await this.userModel.update(userID,{
			photo : photoURL
		});

		if(!updateSuccessful){
			return res.json({
				success : false,
				error   : 'Failed to add new photo'
			});
		}

		return res.json({
			success : true
		});
	}

	/*
		@param - req - express request object
		@param - res - express response object
		Description: get the photo url for a user
	*/
	async photo(req,res){

		const userID = auth.getUserID(req);
		const userIDForPhoto = req.params.userID;

		if(!userID && !userIDForPhoto){
			return res.json({
				success : false,
				error   : 'User id is invalid'
			});
		}

		//get photo for userID
		const url = await this.userModel.getPhoto(userIDForPhoto);

		if(!url){
			return res.json({
				success : false,
				error   : 'Could not get user photo'
			});
		}

		return res.json({
			photo : url
		});
	}

}

module.exports = new UserController();
