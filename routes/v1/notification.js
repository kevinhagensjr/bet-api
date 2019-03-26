const express = require('express');

class NotificationRouter{
	constructor(){
		this.notificationController = require('../../controllers/v1/notification');
		this.router = new express.Router();
		this.listen();
	}

	listen(){
		const self = this;

		this.router.get('/', (req, res) => {
			return self.notificationController.notifications(req, res);
		});

    this.router.get('/:notificationID', (req, res) => {
			return self.notificationController.notification(req, res);
  	});

    this.router.get('/bet/:betID', (req, res) => {
			return self.notificationController.bet(req, res);
  	});

  	this.router.post('/update', (req, res) => {
			return self.notificationController.update(req, res);
  	});
	}
	getRouter(){
		return this.router;
	}
}

const notificationRouter = new NotificationRouter();
module.exports = notificationRouter.getRouter();
