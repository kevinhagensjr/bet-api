const config = require('./../config');
const IncomingWebhook = require('@slack/client').IncomingWebhook;

class Slack{

	constructor(){

	}

	/*
		@param - username - usename of the new user
		@params - email - email address of the new user
		Description: send notification to slack, about new user that has joined
	*/
	sendUserMessage(username,email){
		if(!username || !email){
			debug('Username or Email is null, cant send message');
			return false;
		}

		const webhook = new IncomingWebhook(config.slack.webhook,{
			username : config.slack.username,
			channel	 : config.slack.channels.user
		});

		const message = 'New user: `' + username + '` , contact them via ' + email + '';
		webhook.send(message);
	}

	/*
		@param - url - url to published story
		Description: send notification to slack, about a newly published story
	*/
	sendStoryMessage(url){
		if(!url){
			debug('URL is null, cant send ' + config.slack.channels.story + ' message');
			return false;
		}

		const webhook = new IncomingWebhook(config.slack.webhook,{
			username : config.slack.username,
			channel	 : config.slack.channels.story
		});

		const message = 'New story has been published: `' + url + '`' ;
		webhook.send(message);
	}

	/*
		@param - name - full name of perspective user
		@param - email - email of the perspective user
		Description: send notification to slack, new beta sign up
	*/
	sendBetaMessage(betaObject){
		if(!betaObject.hasOwnProperty('name') || !betaObject.hasOwnProperty('email')){
			debug('name or email is invalid , cannot send meesage');
			return false;
		}

		const webhook = new IncomingWebhook(config.slack.webhook,{
			username : config.slack.username,
			channel	 : config.slack.channels.signup
		});

		let message = betaObject.name + ' has signed up for beta, contact them via `' + betaObject.email + '`';
		if(betaObject.hasOwnProperty('phone')){
			message += ' or by phone @ `' + betaObject.phone + '`';
		}

		webhook.send(message);
		return true;
	}

	/*
		@param - username - full name of perspective user
		@param - text - feedback message from the user
		@param - rating - up or down
		@param - channel - the channel that the user is posting to
		Description: send notification to slack, user has submitted feedback
	*/
	sendFeedbackMessage(username,text,rating,channel){
		const newLine = require('os').EOL;
		if(!username || !text || !rating || !channel ){
			debug('Feedback message data is null somewhere, cannot send message');
			return false;
		}

		let type = null;
		switch(channel){
			case config.slack.channels.feedback.general:
			 type = 'general';
			break;
			case config.slack.channels.feedback.reaction:
				type = 'reaction feature';
			break;
			case config.slack.channels.feedback.publish:
				type = 'publishing feature';
			break;
		}

		//TO DO: save user feedback in database for metrics

		const message = '`@' + username + '` has shared ' + type + ' feedback: ' + newLine + '```' + text + '```' + newLine + 'Overall Rating: ' + rating;
		webhook.send(message);
	}


}

module.exports = new Slack();
