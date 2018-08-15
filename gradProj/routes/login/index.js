var express = require('express');
var router = express.Router();

router.use('/signin',require('./signin.js'));
router.use('/signup',require('./signup.js'));



module.exports = router;