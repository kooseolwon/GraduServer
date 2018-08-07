var express = require('express');
var router = express.Router();


router.use('/board',require('./board/index.js'));
router.use('/login',require('./login/index.js'));
router.use('/comment',require('./comment/index.js'));
router.use('/bookmark',require('./bookmark/index.js'));




module.exports = router;
