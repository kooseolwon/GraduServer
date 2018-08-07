const express = require('express');
const router = express.Router();

const crypto = require('crypto-promise');		// crypto 모듈의 promise 버전
const db = require('../../module/pool.js');

//POST 56.~~~/login/singin

router.post('/',async (req,res) =>{
    let user_id = req.body.user_id;
    let user_pw = req.body.user_pw;

    if(!user_id || !user_pw){

        res.status(400).send({
            message:"fail signin from client, null value"
        });
    } else{
        let checkQuery = 'SELECT * FROM user_table WHERE user_id = ?';
        let checkResult = await db.queryParam_Arr(checkQuery, [user_id]);

        if(!checkResult){
            res.status(500).send({
                message:"fail signin from server"
            });
        }else if(checkResult.length ===1){
            let hashedpw = await crypto.pbkdf2(user_pw, checkResult[0].user_salt, 100000, 32, 'sha512');
            if(hashedpw.toString('base64') === checkResult[0].user_pw){

                res.status(201).send({
                    message:"success signin",
                    user_index:checkResult[0].user_index
                });
            }else{
                res.status(400).send({
                    message:"fail signin from client, login failed"
                });
                console.log("pwd error");
            }
        } else{
            res.status(400).send({

                message:"fail signin from client, login failed"
            });
            console.log("id error");
        }
    }
});


module.exports = router;