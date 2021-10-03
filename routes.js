const express = require('express');
const controller = require('./controller');

var router = express.Router();

router.route('/').get(controller.getHomepage);

router.route('/common/:member_id').get(controller.getMember);

router.route('*').get(controller.getError);

module.exports = router;