const Sequelize = require('sequelize');
const sequelize = require('../sqlite');

const Actor = sequelize.define('actor', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    login: Sequelize.STRING,
    avatar_url: Sequelize.STRING,
});

module.exports = Actor;