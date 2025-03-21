const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../sqlite');
const Actor = require('./Actor');
const Repo = require('./Repo');

const Event = sequelize.define('event', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    type: Sequelize.STRING,
    created_at: {
        type: Sequelize.DATE,
        get() {
            const date = this.getDataValue('created_at');
            return moment(date).format('YYYY-MM-DD HH:mm:ss');
        },
    },
});

Event.belongsTo(Actor);
Event.belongsTo(Repo);
Actor.hasMany(Event);

module.exports = Event;