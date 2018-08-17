const express = require('express');
const router = express.Router();
const crypto = require('crypto-promise');
const db = require('../../module/pool.js');

//52.~~~~/login/singup
router.post('/',async(req,res)=>{
    let user_id = req.body.user_id;
    let user_pw = req.body.user_pw;
    let user_name = req.body.user_name;

    if(!user_id && !user_pw && !user_name){
        res.status(400).send({
            message: "fail signup from client, null value"
        });
    }else{
        let checkQuery = 'SELECT * FROM user_table WHERE user_id = ?';
        let checkResult = await db.queryParam_Arr(checkQuery,[user_id]);

        if(!checkResult){
            res.status(500).send({
                message:"fail signup from server"
            });
        }else if(checkResult.length ===1){
            res.status(400).send({
                message:"fail signup from client, Already exists"
            });
        }else {
            const salt = await crypto.randomBytes(32);
            const hashedpw = await crypto.pbkdf2(user_pw, salt.toString('base64'), 100000, 32, 'sha512');

            let insertQuery = 'INSERT INTO user_table (user_id, user_pw, user_salt,user_name) VALUES (?,?,?,?)';
            let insertResult = await db.queryParam_Arr(insertQuery,[user_id, hashedpw.toString('base64'),salt.toString('base64'),user_name]);

            if(!insertResult){
                res.status(500).send({
                    message:"fail signup from server"
                });
            } else {
                res.status(201).send({
                    message : "success signup"
                });
            }
        }
    }
});



module.exports = router;