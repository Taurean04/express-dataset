const Sequelize = require('sequelize');
const moment = require('moment');
const _ = require('lodash');
const Actor = require('../models/Actor');
const Event = require('../models/Event');

var getAllActors = () => {
	try{
		const actors = await Actor.findAll({
			attributes: {
				include: [
					'id',
					'login',
					'avatar_url',
					[Sequelize.fn('COUNT', Sequelize.col('events.actorId')), 'eventCount'],
					[Sequelize.fn('max', Sequelize.col('events.created_at')), 'latestEvent'],
				],
			  	exclude: ['createdAt', 'updatedAt'],
			},
			include: [{
			  	model: Event, attributes: [],
			}],
			group: ['events.actorId'],
			order: [
				[Sequelize.literal('eventCount'), 'DESC'],
				[Sequelize.literal('latestEvent'), 'DESC'],
				['login'],
			],
		});
		const modifiedActors = actors.map(actor => ({
			id: actor.id,
			login: actor.login,
			avatar_url: actor.avatar_url,
		}));
		return res.status(200).send(modifiedActors);
	}catch(e){
        console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};

var updateActor = () => {
	try {
		const { avatar_url, id, login } = req.body;
		const actorInDB = await Actor.findByPk(id);
		if (!actorInDB) {
			return res.status(404).send({});
		}
		if (login !== actorInDB.login) {
			return res.status(400).send({});
		}
		await Actor.update({
			avatar_url,
		}, {
			where: {
				id,
			},
		});
		return res.status(200).send({});
	} catch (e) {
		console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};

var getStreakInfo = (allEvents) => {
	const streakInfo = {};
	allEvents.forEach((event) => {
		const { actorId, created_at } = event;
	  	if (streakInfo[actorId]) {
		
		const actorStreak = streakInfo[actorId];
		const lastEvent = moment(actorStreak.lastEvent, 'YYYY-MM-DD');
		const currentEvent = moment(created_at, 'YYYY-MM-DD');
		const daysDifference = lastEvent.diff(currentEvent, 'days');
			if (daysDifference === 1) {
				actorStreak.currentStreak += 1;
				if (actorStreak.currentStreak > actorStreak.highestStreak) {
					actorStreak.highestStreak = actorStreak.currentStreak;
				} 
				else {
					// do nothing
				}
			} else if (daysDifference > 1) {
				// reset streak
				actorStreak.currentStreak = 0;
			} 
			else {
				// do nothing
			}
			actorStreak.lastEvent = created_at;
	  	} else {
			streakInfo[actorId] = {
				currentStreak: 0,
				highestStreak: 0,
				lastEvent: created_at,
				latestEvent: moment(created_at).valueOf(),
				login: event.actor.login,
			};
	  	}
	});
	return streakInfo;
};
  
var getStreakInfoArray = streakInfo => Object.keys(streakInfo).map(actorId => ({
	actorId,
	highestStreak: streakInfo[actorId].highestStreak,
	latestEvent: streakInfo[actorId].latestEvent,
	login: streakInfo[actorId].login,
}));
  
var getActorsIdByStreak = sortedStreakInfo => sortedStreakInfo.map(info => Number(info.actorId));

var getStreak = () => {
	try{
		const allEvents = await Event.findAll({
			include: [Actor],
			order: [
				['actorId'],
				['created_at', 'DESC'],
			],
		});
		const streakInfo = getStreakInfo(allEvents);
		const streakInfoArray = getStreakInfoArray(streakInfo);
		const sortedStreakInfo = _.orderBy(
			streakInfoArray,
			['highestStreak', 'latestEvent', 'login'],
			['desc', 'desc', 'asc'],
		);
		const actorsIdByStreak = getActorsIdByStreak(sortedStreakInfo);
		const actorsInOrder = await Promise.all(actorsIdByStreak.map(actorId => Actor.findOne({
			where: {
			  	id: actorId,
			},
			attributes: {
				include: ['id', 'login', 'avatar_url'],
				exclude: ['createdAt', 'updatedAt'],
			},
		})));
		return res.status(200).send(actorsInOrder);
	}catch(e){
        console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};


module.exports = {
	updateActor: updateActor,
	getAllActors: getAllActors,
	getStreak: getStreak
};