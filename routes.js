const express = require('express');
const controller = require('./controller');

var router = express.Router();

router.route('/').get(controller.getHomepage);

router.route('/common/:member_id').get(controller.getMember);

router.route('/api/chart/:member_id/:stream_id').get(controller.getSurroundingChartData);

router.route('*').get(controller.getError);

module.exports = router;