const express = require('express');
const router = express.Router();

router.use('/',require('./array.js'));

module.exports = router;