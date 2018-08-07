var express = require('express');
var router = express.Router();

router.use('/',require('./comment.js'));



module.exports = router;