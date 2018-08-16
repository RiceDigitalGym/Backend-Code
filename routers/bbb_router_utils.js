var models = require('../models');
var BikeData = models.BikeData;
var RaspberryPi = models.RaspberryPi;
var SessionData = models.SessionData;
var Tag = models.Tag;
var User = models.User;
var sequelize = require('sequelize');
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var config = require('../dev-config');

var test = config.db.test


// Helper functions for creating model instances

function createBikeData(rpm, bikeID, sessionID, time) {
	return BikeData.create({
		stamp: time,
		rpm: rpm,
		bikeID: bikeID,
		sessionID: sessionID
	})
}

function createRaspberryPi(serialNumber, machineID, machineType) {
	return RaspberryPi.create({
		serialNumber: serialNumber,
		machineID: machineID,
		machineType: machineType
	}).error(function(error) {
		console.log("ERRRORRRRRRRR: " + error);
	})
}

function createSessionWithTimes(sessionObject) {
	return SessionData.create({
		RFID: sessionObject.RFID,
		userID: sessionObject.userID,
		machineID: sessionObject.machineID,
		stampStart: sessionObject.stampStart,
		stampEnd: sessionObject.stampEnd
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
			registered: 0,
			machineID: machineID
		}
	}).then(function(latestCreatedTime) {
		return Tag.update({
			registered: true,
			tagName: tagName,
			userID: userID
		}, {
			where: {
				machineID: machineID,
				registered: 0,
				createdAt: latestCreatedTime
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

function clearDataBaseTable(model) {
	return model.truncate();
}

function clearTestTables() {
	if (test) {
		return Promise.all([
			clearDataBaseTable(BikeData),
			clearDataBaseTable(RaspberryPi),
			clearDataBaseTable(SessionData),
			clearDataBaseTable(Tag),
			clearDataBaseTable(User)
		])
	} else {
		return null
	}
}

function updatePingTime(serialNumber) {
	return RaspberryPi.update({
		lastPing: moment(new Date().getTime()).tz("America/Chicago").format("ddd, YYYY-MM-DD h:mm:ss A")
	}, {
		where: {
			serialNumber: serialNumber
		}
	});
}

function updateRebootTime(serialNumber) {
	return RaspberryPi.update({
		lastReboot: moment(new Date().getTime()).tz("America/Chicago").format("ddd, YYYY-MM-DD h:mm:ss A")
	}, {
		where: {
			serialNumber: serialNumber
		}
	});
}

// Helper functions for reading model instances

function findBikeData(sessionID) {
	return BikeData.findAll({
		where: {
			sessionID: sessionID
		}
	});
}


// function findRecentBikeData(sessionID, seconds) {
// 	return BikeData.findOne({
// 		where: {
// 			sessionID: sessionID,
// 			stamp: {
// 				$gt: new Date().getTime() - (seconds * 1000)
// 			} 
// 		}
// 	})
// }

function findRecentBikeData(sessionID) {
	return BikeData.findOne({
		where: {
			sessionID: sessionID
		},
		order: [
			['stamp', 'DESC']
		]
	});
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

function findCurrentSessionUsingUserID(userID) {
	return SessionData.findOne({
		where: {
			userID: userID,
			stampEnd: null
		}
	});
}

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

function findEndedSessionsUsingUserID(userID) {
	return SessionData.findAll({
		where: {
			userID: userID,
			stampEnd: {
				$ne: null
			}
		}
	});
}

function findStartTimeOfLatestEndedSessionUsingUserID(userID) {
	return SessionData.max('stampStart', {
		where: {
			userID: userID,
			stampEnd: {
				$ne: null
			}
		}
	});
}

function findAllPis() {
	return RaspberryPi.findAll();
}

function findEndedSessionsOnMachine(machineID) {
	return SessionData.findAll({
		where: {
			machineID: machineID,
			stampEnd: {
				$ne: null
			}
		}
	})
}





module.exports = {
	createBikeData: createBikeData,
	createRaspberryPi: createRaspberryPi,
	createSessionWithTimes: createSessionWithTimes,
	createSession: createSession,
	createTag: createTag,
	createUser: createUser,
	registerTag: registerTag,
	addTagToSession: addTagToSession,
	endSession: endSession,
	clearDataBaseTable: clearDataBaseTable,
	clearTestTables: clearTestTables,
	updatePingTime: updatePingTime,
	updateRebootTime: updateRebootTime,
	findBikeData: findBikeData,
	findRecentBikeData: findRecentBikeData,
	findRaspPiUsingSerial: findRaspPiUsingSerial,
	findCurrentSessionUsingMachineID: findCurrentSessionUsingMachineID,
	findTag: findTag,
	findUserUsingEmail: findUserUsingEmail,
	findCurrentSessionUsingUserID: findCurrentSessionUsingUserID,
	findEndedSessionsUsingUserID: findEndedSessionsUsingUserID,
	findStartTimeOfLatestEndedSessionUsingUserID: findStartTimeOfLatestEndedSessionUsingUserID,
	findAllPis: findAllPis,
	findEndedSessionsOnMachine: findEndedSessionsOnMachine
}

