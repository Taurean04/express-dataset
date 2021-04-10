const Event = require('../models/Event');
const Actor = require('../models/Actor');
const Repo = require('../models/Repo');

var getAllEvents = async (req, res) => {
	try {
		const events = await Event.findAll({
			attributes: {
			  	exclude: ['createdAt', 'updatedAt', 'actorId', 'repoId'],
			},
			include: [
				{
					model: Actor,
					attributes: ['id', 'login', 'avatar_url'],
				},
				{
					model: Repo,
					attributes: ['id', 'name', 'url'],
				},
			],
			order: [['id']],
		});
		return res.status(200).send(events);
	} catch(e) {
		console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};

var createEvent = async (event) => {
	const {
	  	id, type, actor, repo, created_at,
	} = event;
	await Event.create({
		id,
		type,
		created_at,
		actorId: actor.id,
		repoId: repo.id,
	});
};
  
var createActor = async (actor) => {
	const { id, login, avatar_url } = actor;
	await Actor.create({
		id,
		login,
		avatar_url,
	});
};
  
var createRepo = async (repo) => {
	const { id, name, url } = repo;
	await Repo.create({
		id,
		name,
		url,
	});
};

var addEvent = async (req, res, next) => {
	try {
		const {
			id, actor, repo,
		} = req.body;
		const [actorInDB, eventInDB, repoInDB] = await Promise.all([
			Actor.findByPk(actor.id),
			Event.findByPk(id),
			Repo.findByPk(repo.id),
		]);
		if (eventInDB) {
			return res.status(400).send({});
		}
		  // check this event
		if (!actorInDB) {
			await createActor(actor);
		}
		if (!repoInDB) {
			await createRepo(repo);
		}
		await createEvent(req.body);
		return res.status(201).send({});
	}catch(e) {
		console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};


var getByActor = async (req, res) => {
	try {
		const { id } = req.params;
		const events = await Event.findAll({
			where: {
				actorId: id,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'actorId', 'repoId'],
			},
			include: [
			{
				model: Actor,
				attributes: ['id', 'login', 'avatar_url'],
			},
			{
				model: Repo,
				attributes: ['id', 'name', 'url'],
			},
			],
			order: [['id']],
		});
		return res.status(200).send(events);
	}catch(e) {
		console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};


var eraseEvents = async (req, res) => {
	try {
		await Promise.all([
			Event.destroy({
				where: {},
				truncate: true,
			}),
			Actor.destroy({
				where: {},
				truncate: true,
			}),
			Repo.destroy({
				where: {},
				truncate: true,
			}),
		]);
		
		return res.status(200).send({});
	} catch (e) {
		console.log(e);
        res.status(500).json({message: 'Error occurred', e});
	}
};

module.exports = {
	getAllEvents: getAllEvents,
	addEvent: addEvent,
	getByActor: getByActor,
	eraseEvents: eraseEvents
};

















