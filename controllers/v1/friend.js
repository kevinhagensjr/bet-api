const config = require('./../../config');
const auth = require('./../../services/auth');
const request = require('request');

class FriendController{
	constructor(){
		this.userModel = require('./../../models/user');
		this.friendModel = require('./../../models/friend');
	}

  async getFriends(req,res){
    const userID = auth.getUserID(req);
    if(!userID){
      return res.json({
        success : false,
        error   : 'Account is invalid'
      });
    }

    const friends = await this.friendModel.getFriends(userID);
    if(!friends){
      return res.json([]);
    }
    return res.json(friends);
  }

  async setFriends(req,res){
    const userID = auth.getUserID(req);
    const friendID = req.body.friendID;
    const timestamp = Date.now();

    if(!userID){
      return res.json({
        success : false,
        error   : 'Account is invalid'
      });
    }
    if(!friendID){
      return res.json({
        success : false,
        error   : 'could not find friend'
      });
    }

    const friendsExist = await this.friendModel.friendExists(userID,friendID);
    if(friendsExist){
      const friendsActive = await this.friendModel.friendsActive(userID,friendID);
      if(friendsActive){
        return res.json({
          success : true
        });
      }

      const friendsUpdated = await this.friendModel.update(userID,{status : true});
      if(!friendsUpdated){
        return res.json({
          success : true
        });
      }
    }

    const friendsAdded = await this.friendModel.setFriends({
      status : true,
      userID : userID,
      friendID : friendID,
      timestamp : timestamp
    });

    if(!friendsAdded){
      return res.json({
        success : false,
        error : 'Failed to add friends'
      });
    }
    return res.json({
      success : true
    });
  }

	/*
		@param - req - express request object
		@param - res - express response object
		Description: Update the user account info
	*/
	async update(req,res){
		const userID = auth.getUserID(req);
		const friendID = req.body.friendID;
		const status = req.body.status;

		if(!userID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}

    if(!friendID){
			return res.json({
				success : false,
				error   : 'Account is invalid'
			});
		}
		//update the users account
		const updateSuccessful = await this.friendModel.update(friendID,{
      status : status
    });

		if(!updateSuccessful){
			return res.json({
				success : false,
				error	: 'Failed to update your friendship'
			});
		}
		return res.json({
			success : true
		});
	}

  async remove(req,res){
    const userID = auth.getUserID(req);
    const friendID = req.params.friendID;

    if(!userID){
      res.json({
        success : false,
        error : 'account is invalid'
      });
    }

		if(!friendID){
			res.json({
				success : false,
				error : 'friend id is invalid'
			});
		}

    const removed = await this.friendModel.remove(friendID);
    if(!removed){
      return res.json({
        success : false,
        error : 'Failed to remove friendship'
      });
    }

    return res.json({
      success : true
    });
  }


}

module.exports = new UserController();
