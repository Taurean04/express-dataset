var express = require('express');
var { eraseEvents } = require('../controllers/events');
var router = express.Router();

// Route related to delete events
router.delete('/', eraseEvents);

module.exports = router;