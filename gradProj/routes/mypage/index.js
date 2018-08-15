const express = require('express');
const router = express.Router();

router.use('/',require('./mypage.js'));
router.use('/detail',require('./detail.js'));




module.exports = router;