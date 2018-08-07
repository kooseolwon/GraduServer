var express = require('express');
var router = express.Router();


router.use('/',require('./single.js'));

module.exports = router;