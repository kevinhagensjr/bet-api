const express = require('express');

class FriendRouter{
	constructor(){
		this.friendController = require('./../../controllers/v1/friend');
		this.router = new express.Router();
		this.listen();
	}

	listen(){
		const self = this;
		this.router.get('/', (req, res) => {
			return self.friendController.getFriends(req, res);
  	});

		this.router.get('/friend/:friendID', (req, res) => {
			return self.friendController.getFriendship(req, res);
  	});

    this.router.post('/new', (req, res) => {
      return self.friendController.setFriends(req, res);
    });

		this.router.post('/update', (req, res) => {
			return self.friendController.update(req, res);
  	});

    this.router.post('/remove', (req, res) => {
      return self.friendController.remove(req, res);
    });

	}
	getRouter(){
		return this.router;
	}
}

//export router for /user endpoint
const userRouter = new UserRouter();
module.exports = userRouter.getRouter();
