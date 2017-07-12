var models = require('../models');
var BikeData = models.BikeData;
var RaspberryPi = models.RaspberryPi;
var SessionData = models.SessionData;
var Tag = models.Tag;
var User = models.User;
var sequelize = require('sequelize');
var bodyParser = require('body-parser');


// Helper functions for creating model instances

function createBikeData(rpm, bikeID, sessionID) {
	return BikeData.create({
		stamp: new Date().getTime(),
		rpm: rpm,
		bikeID: bikeID,
		sessionID: sessionID
	})
}

function createSession(machineID, RFID, userID) {
	return SessionData.create({
		RFID: RFID,
		userID: userID,
		machineID: machineID,
		stampStart: new Date().getTime()
	})
}

function createTag(RFID, tagName, userID, machineID, registered) {
	return Tag.create({
		RFID: RFID,
		tagName: tagName,
		userID: userID,
		machineID: machineID,
		registered: registered
	})
}

function createUser(name, email, pswd, gender, weight, age, height, RFID, resetpasswordcode) {
	return User.create({
		name: name,
		email: email,
		pswd: pswd,
		gender: gender,
		weight: weight,
		age: age,
		height: height,
		RIFD: RFID,
		resetpasswordcode: resetpasswordcode
	})
}

// Helper functions for updating model instances

function registerTag(tagName, userID, machineID) {
	return Tag.max('createdAt', {
		where: {
			registered: 0
		}
	}).then(function(recent) {
		Tag.update({
			registered: true,
			tagName: tagName,
			userID: userID
		}, {
			where: {
				machineID: machineID,
				registered: false,
				createdAt: recent
			}
		})
	})
}

function addTagToSession(RFID, userID, machineID) {
	return SessionData.update({
		RFID: RFID,
		userID: userID
	}, {
		where: {
			machineID: machineID,
			stampEnd: null
		}
	})
}

function endSession(machineID) {
	return SessionData.update({
		stampEnd: new Date().getTime()
	}, {
		where: {
			machineID: machineID,
			stampEnd: null
		}
	})
}

// Helper functions for reading model instances

function findRecentBikeData(seconds) {
	return BikeData.findOne({
		where: {
			stamp: {
				$gt: new Date().getTime() - (seconds * 1000)
			} 
		}
	})
}

function findRaspPiUsingSerial(serialNumber) {
	return RaspberryPi.findOne({
		where: {
			serialNumber: serialNumber
		}
	})
}

function findCurrentSessionUsingMachineID(machineID) {
	return SessionData.findOne({
		where: {
			machineID: machineID,
			stampEnd: null
		}
	})
}

// function isCurrentSession(machineID) {
// 	return findCurrentSessionUsingMachineID(machineID).then(function(session) {
// 		return session ? true : false
// 	})
// }

function findTag(RFID) {
	return Tag.findOne({
		where: {
			RFID: RFID
		}
	})
}

function findUserUsingEmail(email) {
	return User.findOne({
		where: {
			email: email
		}
	})
}



module.exports = {
	createBikeData: createBikeData,
	createSession: createSession,
	createTag: createTag,
	createUser: createUser,
	registerTag: registerTag,
	addTagToSession: addTagToSession,
	endSession: endSession,
	findRecentBikeData: findRecentBikeData,
	findRaspPiUsingSerial: findRaspPiUsingSerial,
	findCurrentSessionUsingMachineID: findCurrentSessionUsingMachineID,
	findTag: findTag,
	findUserUsingEmail: findUserUsingEmail
}