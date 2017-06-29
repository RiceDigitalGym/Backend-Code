var models = require('./models');
var jwt = require ('jsonwebtoken');
var sequelize = require('sequelize');
var User = models.User;

module.exports = function(req, res, next) {
	
	console.log("Header: " + JSON.stringify(req.headers));
	console.log("Body: " + JSON.stringify(req.body));
	console.log("Header authorization: " + req.headers['authorization']);

	if (req.method == 'OPTIONS') {
		console.log("OPTIONS REQUEST FOUND.")
		res.status(200).end();
	}
	
	// allows three ways to insert token into the request
	var token = (req.body && req.body.access_token) 
	    || (req.query && req.query.access_token) 
		|| req.headers['authorization'];

	if (token) {
		jwt.verify(token, 'ashu1234', function(err, decoded) {
			if (err) {
				console.log("Token could not be verified.");
				res.sendStatus(401);
			}
			else {
				req.decoded = decoded;
				console.log("Token has been decoded.");
				next();
			}
		});
		// 	var decoded = jwt.decode(token);
		// 	User.findOne({
		// 		where: {
		// 			id: decoded.userID
		// 		}
		// 	}).then(function(user) {
		// 		if (user) {
		// 			next();
		// 		} else {
		// 			res.status(401).end();
		// 		}
		// 	})
		// } catch (err) {
		// 	res.sendStatus(400);
		// }
	} else {
		res.sendStatus(403);
	}
	
}