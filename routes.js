const express = require('express');
const controller = require('./controller');

var router = express.Router();

router.route('/').get(controller.getHomepage);

router.route('/:member_id').get(controller.getMember);

router.route('/:member_id/:stream_id').get(controller.getStream);

router.route('/api/chart/:member_id/:stream_id').get(controller.getChartData);

router.route('/api/member/all/').get(controller.getAllMemberData);

router.route('*').get(controller.getError);

module.exports = router;