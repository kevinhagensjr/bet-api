const express = require('express');

class BetRouter{
	constructor(){
		this.betController = require('../../controllers/v1/bet');
		this.router = new express.Router();
		this.listen();
	}

	listen(){
		const self = this;

		this.router.get('/', (req, res) => {
			return self.betController.bets(req, res);
		});

		this.router.get('/:betID', (req, res) => {
			return self.betController.bet(req, res);
		});

    this.router.post('/post', (req, res) => {
			return self.betController.post(req, res);
		});

    this.router.post('/remove', (req, res) => {
			return self.betController.remove(req, res);
		});

    this.router.post('/update', (req, res) => {
			return self.betController.update(req, res);
		});
	}

	getRouter(){
		return this.router;
	}
}

//export router for /user endpoint
const betRouter = new BetRouter();
module.exports = betRouter.getRouter();
